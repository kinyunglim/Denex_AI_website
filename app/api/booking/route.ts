import { z } from 'zod';
import { handle, parseInput, readJson } from '@/src/lib/api';
import { requireModule } from '@/src/lib/modules';
import { checkRateLimit, clientIp } from '@/src/lib/rate-limit';
import { getConfig, isPreviewMode } from '@/src/lib/site';
import { toZonedDateStr } from '@/src/lib/time';
import { getActiveTheme } from '@/src/lib/site-context';
import { pickLocalized, Locale } from '@/src/lib/config';
import { ConflictError } from '@/src/lib/errors';
import { BookingService } from '@/src/modules/booking/booking.service';
import { PublicBookingInput } from '@/src/modules/booking/booking.model';
import { PreviewService } from '@/src/modules/preview/preview.service';

const PreviewBookingSchema = z.object({
  serviceId: z.string(),
  staffId: z.string().optional(),
  start: z.string(),
  locale: z.string().default('zh-Hant'),
});

/** POST /api/booking — public online booking (10 per IP per 10 minutes). */
export async function POST(request: Request) {
  return handle(async () => {
    requireModule('booking');
    checkRateLimit(`booking:${clientIp(request)}`, 10, 10 * 60_000);
    const body = await readJson(request);

    if (isPreviewMode()) {
      const data = parseInput(PreviewBookingSchema, body);
      const theme = await getActiveTheme();
      const start = new Date(data.start);
      const date = toZonedDateStr(start, getConfig().timezone);
      const slot = PreviewService.availability(theme, data.serviceId, date, data.staffId).find(
        (s) => s.start === start.toISOString()
      );
      if (!slot) throw new ConflictError('That time is no longer available. Please pick another slot.');
      const service = PreviewService.services(theme).find((s) => s.id === data.serviceId);
      return {
        id: 'preview',
        start: slot.start,
        end: new Date(new Date(slot.start).getTime() + (service?.durationMin ?? 60) * 60_000).toISOString(),
        serviceName: pickLocalized(service?.name, data.locale as Locale),
        staffName: slot.staffName,
      };
    }

    return BookingService.bookOnline(body as PublicBookingInput);
  }, 201);
}
