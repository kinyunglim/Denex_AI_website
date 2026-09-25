import { fail, readJson } from '@/src/lib/api';
import { AppError } from '@/src/lib/errors';
import { checkRateLimit, clientIp } from '@/src/lib/rate-limit';
import { AssistantService } from '@/src/modules/assistant/assistant.service';

/** GET /api/assistant — whether the chat assistant is configured. */
export async function GET() {
  return Response.json({ ok: true, data: { enabled: AssistantService.isEnabled() } });
}

/**
 * POST /api/assistant — streams the assistant's reply as plain text
 * (20 messages per IP per 10 minutes). 503 when no API key is configured.
 */
export async function POST(request: Request) {
  try {
    checkRateLimit(`assistant:${clientIp(request)}`, 20, 10 * 60_000);
    if (!AssistantService.isEnabled()) throw new AppError('Assistant unavailable', 503, 'ASSISTANT_UNAVAILABLE');
    const input = AssistantService.parse(await readJson(request));
    return new Response(AssistantService.stream(input), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return fail(error);
  }
}
