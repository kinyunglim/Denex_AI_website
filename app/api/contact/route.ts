import { handle, readJson } from '@/src/lib/api';
import { checkRateLimit, clientIp } from '@/src/lib/rate-limit';
import { ContactFormService } from '@/src/modules/contact-form/contact-form.service';
import { ContactFormInput } from '@/src/modules/contact-form/contact-form.model';

/** POST /api/contact — public contact form (5 per IP per 10 minutes). */
export async function POST(request: Request) {
  return handle(async () => {
    checkRateLimit(`contact:${clientIp(request)}`, 5, 10 * 60_000);
    return ContactFormService.submit((await readJson(request)) as ContactFormInput);
  });
}
