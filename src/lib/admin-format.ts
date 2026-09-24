import { getConfig } from '@/src/lib/site';

/** Date/money formatting for admin pages, always in the business time zone. */
export function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat('zh-HK', { timeZone: getConfig().timezone, dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(iso));
}

export function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('zh-HK', { timeZone: getConfig().timezone, dateStyle: 'medium' }).format(new Date(iso));
}

export function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: getConfig().timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat('en-HK', { style: 'currency', currency: getConfig().currency }).format(n);
}
