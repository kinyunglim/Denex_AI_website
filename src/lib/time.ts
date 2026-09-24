/**
 * Time-zone aware helpers (ported from OnMove's HK-only lib/time.ts and
 * generalised to any IANA zone). Dates are "YYYY-MM-DD" wall-clock strings in
 * the business time zone; minutes are minutes from local midnight.
 */
export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function minutesToHHMM(min: number): string {
  return `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
}

function parts(d: Date, tz: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(d)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value);
  }
  return out;
}

/** Offset of `tz` from UTC at instant `d`, in minutes (e.g. +480 for HK). */
export function tzOffsetMinutes(d: Date, tz: string): number {
  const p = parts(d, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(d.getTime() / 1000) * 1000) / 60000);
}

/** UTC instant for a wall-clock date + minutes in `tz`. */
export function zonedDateAtMinutes(dateStr: string, minutes: number, tz: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, Math.floor(minutes / 60), minutes % 60);
  let result = guess - tzOffsetMinutes(new Date(guess), tz) * 60000;
  // Re-check once in case the guess crossed a DST boundary.
  const corrected = guess - tzOffsetMinutes(new Date(result), tz) * 60000;
  if (corrected !== result) result = corrected;
  return new Date(result);
}

/** "YYYY-MM-DD" of instant `d` in `tz`. */
export function toZonedDateStr(d: Date, tz: string): string {
  const p = parts(d, tz);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

/** Minutes from local midnight of instant `d` in `tz`. */
export function zonedMinutesOfDay(d: Date, tz: string): number {
  const p = parts(d, tz);
  return p.hour * 60 + p.minute;
}

/** Weekday (0=Sun..6=Sat) of a wall-clock date string. */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Adds whole days to a wall-clock date string. */
export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`;
}

export function isDateStr(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

export function formatTime(d: Date, tz: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

export function formatDate(d: Date, tz: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}
