import Stripe from 'stripe';
import { AppError } from '@/src/lib/errors';

/**
 * Stripe calls used by orders, behind a small interface so tests can fake it.
 * Deposits use manual capture: the card is authorised at checkout and only
 * charged when the owner approves the order.
 */
export type DepositCheckout = { sessionId: string; url: string };
export type GatewayEvent =
  | { type: 'authorized'; sessionId: string; paymentIntentId: string }
  | { type: 'expired'; sessionId: string }
  | { type: 'ignored' };

export interface PaymentGateway {
  createDepositCheckout(input: {
    ref: string;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<DepositCheckout>;
  capture(paymentIntentId: string): Promise<void>;
  release(paymentIntentId: string): Promise<void>;
  parseWebhook(rawBody: string, signature: string | null): GatewayEvent;
}

export class StripeGateway implements PaymentGateway {
  private stripe: Stripe;

  constructor(secretKey: string, private webhookSecret: string | undefined) {
    this.stripe = new Stripe(secretKey);
  }

  async createDepositCheckout(input: Parameters<PaymentGateway['createDepositCheckout']>[0]): Promise<DepositCheckout> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: input.customerEmail,
      client_reference_id: input.ref,
      payment_intent_data: { capture_method: 'manual', description: input.description, metadata: { orderRef: input.ref } },
      line_items: [
        {
          quantity: 1,
          price_data: { currency: input.currency.toLowerCase(), unit_amount: Math.round(input.amount * 100), product_data: { name: input.description } },
        },
      ],
      metadata: { orderRef: input.ref },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });
    if (!session.url) throw new AppError('Stripe did not return a checkout URL', 502, 'STRIPE');
    return { sessionId: session.id, url: session.url };
  }

  async capture(paymentIntentId: string): Promise<void> {
    await this.stripe.paymentIntents.capture(paymentIntentId);
  }

  async release(paymentIntentId: string): Promise<void> {
    await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  parseWebhook(rawBody: string, signature: string | null): GatewayEvent {
    if (!this.webhookSecret) throw new AppError('ORDER_STRIPE_WEBHOOK_SECRET is not set', 503, 'NOT_CONFIGURED');
    if (!signature) throw new AppError('Missing Stripe signature', 400, 'VALIDATION');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch {
      throw new AppError('Invalid Stripe signature', 400, 'VALIDATION');
    }
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      const pi = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id;
      return pi ? { type: 'authorized', sessionId: s.id, paymentIntentId: pi } : { type: 'ignored' };
    }
    if (event.type === 'checkout.session.expired') {
      return { type: 'expired', sessionId: (event.data.object as Stripe.Checkout.Session).id };
    }
    return { type: 'ignored' };
  }
}

let injected: PaymentGateway | null | undefined;

/** The configured gateway, or null when Stripe is not set up (orders then skip payment). */
export function getGateway(): PaymentGateway | null {
  if (injected !== undefined) return injected;
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new StripeGateway(key, process.env.ORDER_STRIPE_WEBHOOK_SECRET) : null;
}

/** Tests only: `undefined` restores the env-based default. */
export function setGateway(gateway: PaymentGateway | null | undefined): void {
  injected = gateway;
}
