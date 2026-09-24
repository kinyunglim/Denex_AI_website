import { handle } from '@/src/lib/api';
import { OrdersService } from '@/src/modules/orders/orders.service';

/**
 * POST /api/orders/stripe-webhook — Stripe events for order deposits
 * (checkout.session.completed / checkout.session.expired).
 * Signing secret: ORDER_STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  return handle(async () => ({ result: await OrdersService.handleWebhook(await request.text(), request.headers.get('stripe-signature')) }));
}
