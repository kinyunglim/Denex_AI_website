import { handle } from '@/src/lib/api';
import { requireModule } from '@/src/lib/modules';
import { ValidationError } from '@/src/lib/errors';
import { isPreviewMode } from '@/src/lib/site';
import { getActiveTheme } from '@/src/lib/site-context';
import { BookingService } from '@/src/modules/booking/booking.service';
import { PreviewService } from '@/src/modules/preview/preview.service';

/** GET /api/booking/availability?serviceId=&date=YYYY-MM-DD[&staffId=] */
export async function GET(request: Request) {
  return handle(async () => {
    requireModule('booking');
    const url = new URL(request.url);
    const serviceId = url.searchParams.get('serviceId');
    const date = url.searchParams.get('date');
    const staffId = url.searchParams.get('staffId') || undefined;
    if (!serviceId || !date) throw new ValidationError('serviceId and date are required');
    if (isPreviewMode()) return PreviewService.availability(await getActiveTheme(), serviceId, date, staffId);
    return BookingService.getAvailability(serviceId, date, staffId);
  });
}
