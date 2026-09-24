import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { setupTestDb } from '@/src/test/mongo';
import { BookingService } from '@/src/modules/booking/booking.service';
import { CrmService } from '@/src/modules/crm/crm.service';
import { GcalService, EventsApi } from '@/src/modules/gcal/gcal.service';
import { Mailer } from '@/src/lib/email';
import { resetConfigCache } from '@/src/lib/site';
import clientConfig from '@/client.config';

setupTestDb();

// Pin the settings these tests assume, whatever this client's config says.
const cfg = clientConfig as { modules: Record<string, boolean>; timezone?: string; booking?: object };
const original = { modules: { ...cfg.modules }, timezone: cfg.timezone, booking: cfg.booking };
function pinConfig() {
  cfg.modules = { ...original.modules, booking: true, gcal: false };
  cfg.timezone = 'Asia/Hong_Kong';
  cfg.booking = { slotStepMin: 30, minNoticeMin: 120, maxDaysAhead: 60 };
  resetConfigCache();
}

const hk = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+08:00`);
const NOW = hk('2026-10-01', '09:00'); // Thursday
const MON = '2026-10-05';

async function setup() {
  const svc = await BookingService.createService({ name: { en: 'Physio' }, durationMin: 60, price: 800 }, 'admin');
  const staff = await BookingService.createStaff(
    { name: 'Joyce', serviceIds: [svc.id], hours: [{ weekday: 1, startMin: 600, endMin: 780 }] },
    'admin'
  );
  return { svc, staff };
}

describe('BookingService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Mailer, 'send').mockResolvedValue(undefined);
    delete process.env.PREVIEW_MODE;
    pinConfig();
  });

  afterEach(() => {
    delete process.env.PREVIEW_MODE;
    GcalService.setEventsApi(null);
    cfg.modules = { ...original.modules };
    cfg.timezone = original.timezone;
    cfg.booking = original.booking;
    resetConfigCache();
  });

  it('lists availability inside working hours', async () => {
    const { svc } = await setup();
    const slots = await BookingService.getAvailability(svc.id, MON, undefined, NOW);
    expect(slots.map((s) => s.start)).toEqual([
      hk(MON, '10:00').toISOString(),
      hk(MON, '10:30').toISOString(),
      hk(MON, '11:00').toISOString(),
      hk(MON, '11:30').toISOString(),
      hk(MON, '12:00').toISOString(),
    ]);
    expect(await BookingService.getAvailability(svc.id, '2026-10-06', undefined, NOW)).toEqual([]);
  });

  it('refuses dates in the past or beyond the booking horizon', async () => {
    const { svc } = await setup();
    expect(await BookingService.getAvailability(svc.id, '2026-09-28', undefined, NOW)).toEqual([]);
    expect(await BookingService.getAvailability(svc.id, '2027-06-07', undefined, NOW)).toEqual([]);
  });

  it('books online, creates the contact and removes the slot', async () => {
    const { svc } = await setup();
    const res = await BookingService.bookOnline(
      { serviceId: svc.id, start: hk(MON, '10:00').toISOString(), name: 'Mandy', phone: '61234567', email: 'm@x.com' },
      NOW
    );
    expect(res.staffName).toBe('Joyce');
    const contacts = await CrmService.allContacts();
    expect(contacts[0].source).toBe('booking');
    const slots = await BookingService.getAvailability(svc.id, MON, undefined, NOW);
    expect(slots.map((s) => s.start)).not.toContain(hk(MON, '10:00').toISOString());
    expect(slots.map((s) => s.start)).not.toContain(hk(MON, '10:30').toISOString());
    expect(Mailer.send).toHaveBeenCalledTimes(2);
  });

  it('rejects a slot that is no longer free', async () => {
    const { svc } = await setup();
    const input = { serviceId: svc.id, start: hk(MON, '10:00').toISOString(), name: 'A', phone: '61234567' };
    await BookingService.bookOnline(input, NOW);
    await expect(BookingService.bookOnline({ ...input, phone: '61234568' }, NOW)).rejects.toThrow('no longer available');
  });

  it('never double-books under concurrent requests', async () => {
    const { svc } = await setup();
    const start = hk(MON, '11:00').toISOString();
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, i) =>
        BookingService.bookOnline({ serviceId: svc.id, start, name: `P${i}`, phone: `6100000${i}` }, NOW)
      )
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const appts = await BookingService.listRange(hk(MON, '00:00'), hk('2026-10-06', '00:00'));
    expect(appts.filter((a) => a.status === 'booked')).toHaveLength(1);
  });

  it('blocks time off and frees cancelled slots', async () => {
    const { svc, staff } = await setup();
    await BookingService.addAway({ staffId: staff.id, start: hk(MON, '10:00'), end: hk(MON, '12:00'), reason: 'Course' }, 'admin');
    let slots = await BookingService.getAvailability(svc.id, MON, undefined, NOW);
    expect(slots.map((s) => s.start)).toEqual([hk(MON, '12:00').toISOString()]);

    const contact = await CrmService.createContact({ name: 'C', phone: '91234567' }, 'admin');
    const appt = await BookingService.bookByAdmin({ serviceId: svc.id, staffId: staff.id, start: hk(MON, '12:00'), contactId: contact.id }, 'admin');
    slots = await BookingService.getAvailability(svc.id, MON, undefined, NOW);
    expect(slots).toEqual([]);
    await BookingService.setStatus(appt.id, 'cancelled');
    slots = await BookingService.getAvailability(svc.id, MON, undefined, NOW);
    expect(slots).toHaveLength(1);
  });

  it('admin booking refuses overlaps and time off', async () => {
    const { svc, staff } = await setup();
    const contact = await CrmService.createContact({ name: 'C', phone: '91234567' }, 'admin');
    await BookingService.bookByAdmin({ serviceId: svc.id, staffId: staff.id, start: hk(MON, '15:00'), contactId: contact.id }, 'admin');
    await expect(
      BookingService.bookByAdmin({ serviceId: svc.id, staffId: staff.id, start: hk(MON, '15:30'), contactId: contact.id }, 'admin')
    ).rejects.toThrow('just taken');
  });

  it('stores nothing in preview mode', async () => {
    const { svc } = await setup();
    process.env.PREVIEW_MODE = '1';
    resetConfigCache();
    const res = await BookingService.bookOnline({ serviceId: svc.id, start: hk(MON, '10:00').toISOString(), name: 'V', email: 'v@x.com' }, NOW);
    expect(res.id).toBe('preview');
    expect(await CrmService.allContacts()).toEqual([]);
  });

  it('syncs to Google Calendar when gcal is enabled', async () => {
    cfg.modules.gcal = true;
    resetConfigCache();
    const insert = jest.fn(async () => ({ data: { id: 'evt1' } }));
    const del = jest.fn(async () => ({}));
    GcalService.setEventsApi({ insert, patch: jest.fn(), delete: del } as unknown as EventsApi);
    try {
      const { svc, staff } = await setup();
      const contact = await CrmService.createContact({ name: 'C', phone: '91234567' }, 'admin');
      const appt = await BookingService.bookByAdmin({ serviceId: svc.id, staffId: staff.id, start: hk(MON, '10:00'), contactId: contact.id }, 'admin');
      expect(insert).toHaveBeenCalledTimes(1);
      await BookingService.setStatus(appt.id, 'cancelled');
      expect(del).toHaveBeenCalledWith(expect.objectContaining({ eventId: 'evt1' }));
    } finally {
      pinConfig();
    }
  });
});
