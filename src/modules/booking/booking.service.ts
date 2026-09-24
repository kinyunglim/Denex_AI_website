import { ObjectId, WithId } from 'mongodb';
import { parseInput } from '@/src/lib/api';
import { ConflictError, NotFoundError, ValidationError } from '@/src/lib/errors';
import { getConfig, isPreviewMode } from '@/src/lib/site';
import { isEnabled, requireModule } from '@/src/lib/modules';
import { addDays, isDateStr, toZonedDateStr, weekdayOf, zonedDateAtMinutes } from '@/src/lib/time';
import { pickLocalized, Locale } from '@/src/lib/config';
import { Mailer } from '@/src/lib/email';
import { CrmService } from '@/src/modules/crm/crm.service';
import { GcalService } from '@/src/modules/gcal/gcal.service';
import { computeSlots, Busy } from './availability';
import { AppointmentDao, AwayDao, BookingServiceDao, StaffDao } from './booking.dao';
import {
  AdminBookingInput,
  AdminBookingSchema,
  Appointment,
  AppointmentStatus,
  AppointmentSummary,
  APPOINTMENT_STATUSES,
  AwayInput,
  AwayInputSchema,
  AwaySummary,
  BookingService as BookingServiceDoc,
  PublicBookingInput,
  PublicBookingSchema,
  ServiceInput,
  ServiceInputSchema,
  ServiceSummary,
  SlotSummary,
  Staff,
  StaffInput,
  StaffInputSchema,
  StaffSummary,
} from './booking.model';

export type BookingConfirmation = {
  id: string;
  start: string;
  end: string;
  serviceName: string;
  staffName: string;
};

const toService = (d: WithId<BookingServiceDoc>): ServiceSummary => ({
  id: d._id.toHexString(),
  name: d.name,
  durationMin: d.durationMin,
  price: d.price,
  active: d.active,
  order: d.order,
});

const toStaff = (d: WithId<Staff>): StaffSummary => ({
  id: d._id.toHexString(),
  name: d.name,
  serviceIds: d.serviceIds.map((s) => s.toHexString()),
  hours: d.hours,
  active: d.active,
});

const toAppointment = (d: WithId<Appointment>): AppointmentSummary => ({
  id: d._id.toHexString(),
  contactId: d.contactId.toHexString(),
  serviceId: d.serviceId.toHexString(),
  staffId: d.staffId.toHexString(),
  start: d.start.toISOString(),
  end: d.end.toISOString(),
  status: d.status,
  price: d.price,
  notes: d.notes,
  source: d.source,
});

/**
 * Booking business logic: catalogue, staff, time off, availability and
 * appointments. Double-booking is prevented with insert-then-verify (works on
 * standalone MongoDB too): after inserting, if an older overlapping booking
 * exists for the same staff member, the new one is removed and rejected.
 */
export class BookingService {
  // ---------- services ----------
  static async listServices(activeOnly = true): Promise<ServiceSummary[]> {
    return (await BookingServiceDao.findAll(activeOnly)).map(toService);
  }

  static async createService(input: ServiceInput, by: string): Promise<ServiceSummary> {
    const data = parseInput(ServiceInputSchema, input);
    const now = new Date();
    const doc: BookingServiceDoc = { ...data, createdAt: now, updatedAt: now, createdBy: by };
    const id = await BookingServiceDao.insertOne(doc);
    return toService({ ...doc, _id: id });
  }

  static async updateService(id: string, input: ServiceInput): Promise<void> {
    const data = parseInput(ServiceInputSchema, input);
    if (!(await BookingServiceDao.updateById(id, { ...data, updatedAt: new Date() }))) {
      throw new NotFoundError('Service not found');
    }
  }

  // ---------- staff ----------
  static async listStaff(activeOnly = true): Promise<StaffSummary[]> {
    return (await StaffDao.findAll(activeOnly)).map(toStaff);
  }

  static async createStaff(input: StaffInput, by: string): Promise<StaffSummary> {
    const data = parseInput(StaffInputSchema, input);
    const now = new Date();
    const doc: Staff = {
      name: data.name,
      serviceIds: data.serviceIds.map((s) => new ObjectId(s)),
      hours: data.hours,
      active: data.active,
      createdAt: now,
      updatedAt: now,
      createdBy: by,
    };
    const id = await StaffDao.insertOne(doc);
    return toStaff({ ...doc, _id: id });
  }

  static async updateStaff(id: string, input: StaffInput): Promise<void> {
    const data = parseInput(StaffInputSchema, input);
    const ok = await StaffDao.updateById(id, {
      name: data.name,
      serviceIds: data.serviceIds.map((s) => new ObjectId(s)),
      hours: data.hours,
      active: data.active,
      updatedAt: new Date(),
    });
    if (!ok) throw new NotFoundError('Staff not found');
  }

  // ---------- time off ----------
  static async addAway(input: AwayInput, by: string): Promise<AwaySummary> {
    const data = parseInput(AwayInputSchema, input);
    if (!(await StaffDao.findById(data.staffId))) throw new NotFoundError('Staff not found');
    const now = new Date();
    const id = await AwayDao.insertOne({
      staffId: new ObjectId(data.staffId),
      start: data.start,
      end: data.end,
      reason: data.reason,
      createdAt: now,
      updatedAt: now,
      createdBy: by,
    });
    return { id: id.toHexString(), staffId: data.staffId, start: data.start.toISOString(), end: data.end.toISOString(), reason: data.reason };
  }

  static async listUpcomingAway(): Promise<AwaySummary[]> {
    return (await AwayDao.findUpcoming(new Date())).map((a) => ({
      id: a._id.toHexString(),
      staffId: a.staffId.toHexString(),
      start: a.start.toISOString(),
      end: a.end.toISOString(),
      reason: a.reason,
    }));
  }

  static async removeAway(id: string): Promise<void> {
    if (!(await AwayDao.deleteById(id))) throw new NotFoundError('Time off not found');
  }

  // ---------- availability ----------
  private static async busyFor(staffIds: ObjectId[], from: Date, to: Date): Promise<Map<string, Busy[]>> {
    const [appts, away] = await Promise.all([
      AppointmentDao.findBlocking(staffIds, from, to),
      AwayDao.findOverlapping(staffIds, from, to),
    ]);
    const map = new Map<string, Busy[]>();
    for (const b of [...appts, ...away]) {
      const key = b.staffId.toHexString();
      map.set(key, [...(map.get(key) ?? []), { start: b.start, end: b.end }]);
    }
    return map;
  }

  /** Open start times for a service on one local date, optionally for one staff member. */
  static async getAvailability(serviceId: string, dateStr: string, staffId?: string, now: Date = new Date()): Promise<SlotSummary[]> {
    requireModule('booking');
    if (!isDateStr(dateStr)) throw new ValidationError('Invalid date');
    const cfg = getConfig();
    const today = toZonedDateStr(now, cfg.timezone);
    if (dateStr < today || dateStr > addDays(today, cfg.booking.maxDaysAhead)) return [];

    const service = await BookingServiceDao.findById(serviceId);
    if (!service || !service.active) throw new NotFoundError('Service not found');

    const staff = (await StaffDao.findAll(true)).filter(
      (s) => s.serviceIds.some((id) => id.equals(service._id)) && (!staffId || s._id.toHexString() === staffId)
    );
    if (!staff.length) return [];

    const dayStart = zonedDateAtMinutes(dateStr, 0, cfg.timezone);
    const dayEnd = zonedDateAtMinutes(addDays(dateStr, 1), 0, cfg.timezone);
    const busy = await this.busyFor(staff.map((s) => s._id), dayStart, dayEnd);
    const weekday = weekdayOf(dateStr);

    const out: SlotSummary[] = [];
    for (const s of staff) {
      const windows = s.hours.filter((h) => h.weekday === weekday);
      const slots = computeSlots(dateStr, windows, busy.get(s._id.toHexString()) ?? [], service.durationMin, {
        stepMin: cfg.booking.slotStepMin,
        minNoticeMin: cfg.booking.minNoticeMin,
        now,
        tz: cfg.timezone,
      });
      for (const start of slots) out.push({ staffId: s._id.toHexString(), staffName: s.name, start: start.toISOString() });
    }
    return out.sort((a, b) => a.start.localeCompare(b.start) || a.staffName.localeCompare(b.staffName));
  }

  // ---------- appointments ----------
  /** Inserts, then rolls back if an older overlapping booking exists for the staff member. */
  private static async insertWithoutOverlap(doc: Appointment): Promise<ObjectId> {
    const id = await AppointmentDao.insertOne(doc);
    const clashes = await AppointmentDao.findBlocking([doc.staffId], doc.start, doc.end);
    if (clashes.some((c) => !c._id.equals(id) && c._id.toHexString() < id.toHexString())) {
      await AppointmentDao.deleteById(id);
      throw new ConflictError('That time was just taken. Please pick another slot.');
    }
    return id;
  }

  static async bookOnline(input: PublicBookingInput, now: Date = new Date()): Promise<BookingConfirmation> {
    requireModule('booking');
    const data = parseInput(PublicBookingSchema, input);
    const service = await BookingServiceDao.findById(data.serviceId);
    if (!service || !service.active) throw new NotFoundError('Service not found');

    const cfg = getConfig();
    const dateStr = toZonedDateStr(data.start, cfg.timezone);
    const slots = await this.getAvailability(data.serviceId, dateStr, data.staffId, now);
    const match = slots.find((s) => s.start === data.start.toISOString());
    if (!match) throw new ConflictError('That time is no longer available. Please pick another slot.');

    const locale = (data.locale as Locale) ?? cfg.locales[0];
    const serviceName = pickLocalized(service.name, locale);
    const end = new Date(data.start.getTime() + service.durationMin * 60_000);

    if (data.website || isPreviewMode()) {
      return { id: 'preview', start: data.start.toISOString(), end: end.toISOString(), serviceName, staffName: match.staffName };
    }

    const { contact } = await CrmService.findOrCreateContact({
      name: data.name,
      phone: data.phone,
      email: data.email,
      locale: data.locale,
      source: 'booking',
    });
    const created = new Date();
    const doc: Appointment = {
      contactId: new ObjectId(contact.id),
      serviceId: service._id,
      staffId: new ObjectId(match.staffId),
      start: data.start,
      end,
      status: 'booked',
      price: service.price,
      notes: data.notes,
      source: 'online',
      createdAt: created,
      updatedAt: created,
      createdBy: 'online',
    };
    const id = await this.insertWithoutOverlap(doc);
    await this.afterChange({ ...doc, _id: id }, serviceName, match.staffName, contact.name);
    await this.notify(contact.email, data.name, serviceName, match.staffName, data.start);
    return { id: id.toHexString(), start: doc.start.toISOString(), end: end.toISOString(), serviceName, staffName: match.staffName };
  }

  /** Staff-entered booking: ignores minimum notice and working hours, but never double-books. */
  static async bookByAdmin(input: AdminBookingInput, by: string): Promise<AppointmentSummary> {
    const data = parseInput(AdminBookingSchema, input);
    const [service, staff] = await Promise.all([BookingServiceDao.findById(data.serviceId), StaffDao.findById(data.staffId)]);
    if (!service) throw new NotFoundError('Service not found');
    if (!staff) throw new NotFoundError('Staff not found');
    const contact = await CrmService.getContact(data.contactId);
    const end = new Date(data.start.getTime() + service.durationMin * 60_000);
    const away = await AwayDao.findOverlapping([staff._id], data.start, end);
    if (away.length) throw new ConflictError(`${staff.name} is away at that time`);
    const now = new Date();
    const doc: Appointment = {
      contactId: new ObjectId(contact.id),
      serviceId: service._id,
      staffId: staff._id,
      start: data.start,
      end,
      status: 'booked',
      price: data.price ?? service.price,
      notes: data.notes,
      source: 'admin',
      createdAt: now,
      updatedAt: now,
      createdBy: by,
    };
    const id = await this.insertWithoutOverlap(doc);
    const cfg = getConfig();
    await this.afterChange({ ...doc, _id: id }, pickLocalized(service.name, cfg.locales[0]), staff.name, contact.name);
    return toAppointment({ ...doc, _id: id });
  }

  static async setStatus(id: string, status: AppointmentStatus): Promise<AppointmentSummary> {
    if (!(APPOINTMENT_STATUSES as readonly string[]).includes(status)) throw new ValidationError('Invalid status');
    const appt = await AppointmentDao.findById(id);
    if (!appt) throw new NotFoundError('Appointment not found');
    await AppointmentDao.updateById(id, { status, updatedAt: new Date() });
    const updated = { ...appt, status };
    const [service, staff] = await Promise.all([
      BookingServiceDao.findById(appt.serviceId.toHexString()),
      StaffDao.findById(appt.staffId.toHexString()),
    ]);
    const contact = await CrmService.getContact(appt.contactId.toHexString()).catch(() => null);
    await this.afterChange(updated, pickLocalized(service?.name, getConfig().locales[0]), staff?.name ?? '', contact?.name ?? '');
    return toAppointment(updated);
  }

  static async getAppointment(id: string): Promise<AppointmentSummary> {
    const appt = await AppointmentDao.findById(id);
    if (!appt) throw new NotFoundError('Appointment not found');
    return toAppointment(appt);
  }

  static async listRange(from: Date, to: Date): Promise<AppointmentSummary[]> {
    return (await AppointmentDao.findInRange(from, to)).map(toAppointment);
  }

  static async listForContact(contactId: string): Promise<AppointmentSummary[]> {
    return (await AppointmentDao.findByContact(contactId)).map(toAppointment);
  }

  static async countUpcoming(): Promise<number> {
    return AppointmentDao.countFrom(new Date());
  }

  private static async afterChange(appt: WithId<Appointment>, serviceName: string, staffName: string, contactName: string): Promise<void> {
    if (!isEnabled('gcal')) return;
    try {
      await GcalService.syncAppointment({
        appointmentId: appt._id.toHexString(),
        title: `${serviceName} — ${contactName} (${staffName})`,
        start: appt.start,
        end: appt.end,
        cancelled: appt.status === 'cancelled',
      });
    } catch (error) {
      console.error('[Booking] Calendar sync failed:', error);
    }
  }

  private static async notify(email: string | null, name: string, serviceName: string, staffName: string, start: Date): Promise<void> {
    const cfg = getConfig();
    const business = pickLocalized(cfg.business.name, cfg.locales[0]);
    const when = new Intl.DateTimeFormat('en-GB', { timeZone: cfg.timezone, dateStyle: 'full', timeStyle: 'short' }).format(start);
    const text = `${name} — ${serviceName} (${staffName})\n${when}`;
    try {
      await Mailer.send({ to: cfg.notify.email, subject: `[${business}] 新預約 New booking — ${name}`, text });
      if (email) {
        await Mailer.send({
          to: email,
          subject: `${business}：預約確認 Booking confirmed`,
          text: `${text}\n\n${cfg.business.phone}\n${pickLocalized(cfg.business.address, cfg.locales[0])}`,
        });
      }
    } catch (error) {
      console.error('[Booking] Notification failed:', error);
    }
  }
}
