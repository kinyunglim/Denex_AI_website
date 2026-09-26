import { handle, readJson } from '@/src/lib/api';
import { checkRateLimit, clientIp } from '@/src/lib/rate-limit';
import { AppError } from '@/src/lib/errors';
import { getConfig, isShowcaseMode } from '@/src/lib/site';
import { OrdersService } from '@/src/modules/orders/orders.service';
import { OrderInput } from '@/src/modules/orders/orders.model';

/** POST /api/orders — place an order (5 per IP per 10 minutes). Returns { ref, checkoutUrl }. */
export async function POST(request: Request) {
  return handle(async () => {
    checkRateLimit(`order:${clientIp(request)}`, 5, 10 * 60_000);
    const body = (await readJson(request)) as OrderInput & { locale?: string };
    if (isShowcaseMode()) {
      const msg = body.locale === 'en'
        ? 'This is a demo version: online ordering is not open yet. Please use the contact form and we will reply shortly.'
        : '呢個係示範版本，暫時未開放網上落單。請用聯絡表單搵我哋，我哋會盡快回覆。';
      throw new AppError(msg, 503, 'SHOWCASE_MODE');
    }
    const locale = getConfig().locales.includes(body.locale as never) ? body.locale : getConfig().locales[0];
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    return OrdersService.create(body, `${origin}/${locale}`);
  }, 201);
}
