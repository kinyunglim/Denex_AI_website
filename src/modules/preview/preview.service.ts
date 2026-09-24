import { ThemeName } from '@/src/lib/config';
import { getConfig, getDemoData } from '@/src/lib/site';
import { addDays, isDateStr, toZonedDateStr, weekdayOf } from '@/src/lib/time';
import { computeSlots } from '@/src/modules/booking/availability';
import { ServiceSummary, SlotSummary } from '@/src/modules/booking/booking.model';
import { ProductSummary } from '@/src/modules/catalog/catalog.model';

/**
 * Read-only demo data for preview deployments, so a showcase site needs no
 * database at all. Ids are prefixed with "demo-".
 */
export class PreviewService {
  static services(theme: ThemeName): ServiceSummary[] {
    return getDemoData(theme).booking.services.map((s, i) => ({
      id: `demo-${s.key}`,
      name: s.name,
      durationMin: s.durationMin,
      price: s.price,
      active: true,
      order: i,
    }));
  }

  static availability(theme: ThemeName, serviceId: string, dateStr: string, staffId?: string, now: Date = new Date()): SlotSummary[] {
    if (!isDateStr(dateStr)) return [];
    const cfg = getConfig();
    const today = toZonedDateStr(now, cfg.timezone);
    if (dateStr < today || dateStr > addDays(today, cfg.booking.maxDaysAhead)) return [];
    const data = getDemoData(theme).booking;
    const service = data.services.find((s) => `demo-${s.key}` === serviceId);
    if (!service) return [];
    const weekday = weekdayOf(dateStr);
    const out: SlotSummary[] = [];
    for (const staff of data.staff) {
      if (!staff.services.includes(service.key)) continue;
      if (staffId && staffId !== `demo-${staff.key}`) continue;
      const slots = computeSlots(dateStr, staff.hours.filter((h) => h.weekday === weekday), [], service.durationMin, {
        stepMin: cfg.booking.slotStepMin,
        minNoticeMin: cfg.booking.minNoticeMin,
        now,
        tz: cfg.timezone,
      });
      // Hide roughly a third of slots so the calendar looks realistically busy.
      slots
        .filter((_, i) => (i + dateStr.charCodeAt(9) + staff.key.length) % 3 !== 0)
        .forEach((start) => out.push({ staffId: `demo-${staff.key}`, staffName: staff.name, start: start.toISOString() }));
    }
    return out.sort((a, b) => a.start.localeCompare(b.start));
  }

  static staffNames(theme: ThemeName, serviceId: string): { id: string; name: string }[] {
    const data = getDemoData(theme).booking;
    const key = serviceId.replace(/^demo-/, '');
    return data.staff.filter((s) => s.services.includes(key)).map((s) => ({ id: `demo-${s.key}`, name: s.name }));
  }

  static products(theme: ThemeName): ProductSummary[] {
    return getDemoData(theme).products.map((p, i) => ({
      id: `demo-${i}`,
      name: p.name,
      description: p.description,
      category: p.category,
      image: p.image,
      specs: p.specs,
      active: true,
      order: i,
    }));
  }
}
