import { handle } from '@/src/lib/api';
import { requireModule } from '@/src/lib/modules';
import { StripeService } from '@/src/modules/stripe/stripe.service';

/**
 * POST /api/stripe/webhook — Stripe calls this after checkout.
 * Reads the raw body (signature verification needs the exact bytes).
 */
export async function POST(request: Request) {
  return handle(async () => {
    requireModule('stripe');
    const raw = await request.text();
    const result = await StripeService.handleWebhook(raw, request.headers.get('stripe-signature'));
    return { result };
  });
}
