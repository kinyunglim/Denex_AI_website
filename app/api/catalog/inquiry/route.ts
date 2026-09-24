import { handle, readJson } from '@/src/lib/api';
import { checkRateLimit, clientIp } from '@/src/lib/rate-limit';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { InquiryInput } from '@/src/modules/catalog/catalog.model';

/** POST /api/catalog/inquiry — product enquiry (5 per IP per 10 minutes). */
export async function POST(request: Request) {
  return handle(async () => {
    checkRateLimit(`inquiry:${clientIp(request)}`, 5, 10 * 60_000);
    const body = (await readJson(request)) as InquiryInput;
    // Preview ids ("demo-0") are not ObjectIds; drop them so validation passes.
    if (typeof body.productId === 'string' && body.productId.startsWith('demo-')) delete body.productId;
    return CatalogService.submitInquiry(body);
  });
}
