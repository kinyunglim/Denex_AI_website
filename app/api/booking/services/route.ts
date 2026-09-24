import { handle } from '@/src/lib/api';
import { requireModule } from '@/src/lib/modules';
import { isPreviewMode } from '@/src/lib/site';
import { getActiveTheme } from '@/src/lib/site-context';
import { BookingService } from '@/src/modules/booking/booking.service';
import { PreviewService } from '@/src/modules/preview/preview.service';

/** GET /api/booking/services — bookable services with the staff who offer them. */
export async function GET() {
  return handle(async () => {
    requireModule('booking');
    if (isPreviewMode()) {
      const theme = await getActiveTheme();
      return PreviewService.services(theme).map((s) => ({ ...s, staff: PreviewService.staffNames(theme, s.id) }));
    }
    const [services, staff] = await Promise.all([BookingService.listServices(true), BookingService.listStaff(true)]);
    return services.map((s) => ({
      ...s,
      staff: staff.filter((m) => m.serviceIds.includes(s.id)).map((m) => ({ id: m.id, name: m.name })),
    }));
  });
}
