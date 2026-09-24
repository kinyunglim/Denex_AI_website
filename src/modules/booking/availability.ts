import { zonedDateAtMinutes } from '@/src/lib/time';

/**
 * Bookable-slot calculation (ported from OnMove lib/availability.ts).
 * Pure: no DB, no clock — pass everything in, so it is easy to test.
 */
export type Busy = { start: Date; end: Date };
export type Window = { startMin: number; endMin: number };

export type SlotOptions = {
  stepMin: number;
  minNoticeMin: number;
  now: Date;
  tz: string;
};

export function overlapsAny(start: Date, end: Date, busy: Busy[]): boolean {
  return busy.some((b) => start < b.end && end > b.start);
}

/**
 * Start times for one staff member on one local date.
 *
 * @param dateStr     local date "YYYY-MM-DD"
 * @param windows     working windows for that weekday
 * @param busy        existing appointments and time off that block the staff member
 * @param durationMin length of the service being booked
 */
export function computeSlots(dateStr: string, windows: Window[], busy: Busy[], durationMin: number, opts: SlotOptions): Date[] {
  const earliest = new Date(opts.now.getTime() + opts.minNoticeMin * 60_000);
  const slots = new Map<number, Date>();
  for (const w of windows) {
    for (let m = w.startMin; m + durationMin <= w.endMin; m += opts.stepMin) {
      const start = zonedDateAtMinutes(dateStr, m, opts.tz);
      const end = zonedDateAtMinutes(dateStr, m + durationMin, opts.tz);
      if (start < earliest) continue;
      if (overlapsAny(start, end, busy)) continue;
      slots.set(start.getTime(), start);
    }
  }
  return [...slots.values()].sort((a, b) => a.getTime() - b.getTime());
}
