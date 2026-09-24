import { describe, expect, it } from '@jest/globals';
import { computeSlots, overlapsAny } from '@/src/modules/booking/availability';
import { addDays, tzOffsetMinutes, weekdayOf, zonedDateAtMinutes, toZonedDateStr, zonedMinutesOfDay } from '@/src/lib/time';

const HK = 'Asia/Hong_Kong';
const hk = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+08:00`);

describe('time helpers', () => {
  it('converts HK wall time to UTC', () => {
    expect(zonedDateAtMinutes('2026-10-05', 9 * 60 + 30, HK).toISOString()).toBe('2026-10-05T01:30:00.000Z');
    expect(tzOffsetMinutes(new Date(), HK)).toBe(480);
  });

  it('handles a DST zone', () => {
    // London is UTC+1 in summer, UTC+0 in winter.
    expect(zonedDateAtMinutes('2026-07-01', 600, 'Europe/London').toISOString()).toBe('2026-07-01T09:00:00.000Z');
    expect(zonedDateAtMinutes('2026-12-01', 600, 'Europe/London').toISOString()).toBe('2026-12-01T10:00:00.000Z');
  });

  it('round-trips date and minutes', () => {
    const d = zonedDateAtMinutes('2026-10-05', 23 * 60 + 15, HK);
    expect(toZonedDateStr(d, HK)).toBe('2026-10-05');
    expect(zonedMinutesOfDay(d, HK)).toBe(23 * 60 + 15);
  });

  it('computes weekday and adds days across months', () => {
    expect(weekdayOf('2026-10-05')).toBe(1);
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });
});

describe('computeSlots', () => {
  const date = '2026-10-05';
  const opts = { stepMin: 30, minNoticeMin: 0, now: hk('2026-10-01', '00:00'), tz: HK };

  it('generates slots within the window that fit the duration', () => {
    const slots = computeSlots(date, [{ startMin: 600, endMin: 720 }], [], 60, opts);
    expect(slots.map((s) => s.toISOString())).toEqual([
      hk(date, '10:00').toISOString(),
      hk(date, '10:30').toISOString(),
      hk(date, '11:00').toISOString(),
    ]);
  });

  it('skips slots that overlap busy time', () => {
    const busy = [{ start: hk(date, '10:30'), end: hk(date, '11:30') }];
    const slots = computeSlots(date, [{ startMin: 600, endMin: 780 }], busy, 60, opts);
    expect(slots.map((s) => s.toISOString())).toEqual([hk(date, '11:30').toISOString(), hk(date, '12:00').toISOString()]);
  });

  it('respects minimum notice', () => {
    const slots = computeSlots(date, [{ startMin: 600, endMin: 720 }], [], 60, {
      ...opts,
      now: hk(date, '09:00'),
      minNoticeMin: 120,
    });
    expect(slots.map((s) => s.toISOString())).toEqual([hk(date, '11:00').toISOString()]);
  });

  it('de-duplicates overlapping windows', () => {
    const slots = computeSlots(date, [{ startMin: 600, endMin: 720 }, { startMin: 660, endMin: 720 }], [], 60, opts);
    expect(slots).toHaveLength(3);
  });

  it('overlapsAny treats touching intervals as free', () => {
    expect(overlapsAny(hk(date, '10:00'), hk(date, '11:00'), [{ start: hk(date, '11:00'), end: hk(date, '12:00') }])).toBe(false);
  });
});
