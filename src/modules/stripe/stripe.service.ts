import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getDb } from '@/src/lib/mongodb';
import { parseInput } from '@/src/lib/api';
import { AppError, ValidationError } from '@/src/lib/errors';
import { getConfig } from '@/src/lib/site';
import { requireModule } from '@/src/lib/modules';
import { CrmService } from '@/src/modules/crm/crm.service';
import { PaymentsService } from '@/src/modules/payments/payments.service';

/**
 * Stripe Checkout links + webhook (depends on the payments module).
 * `stripe_sessions` tracks each link; the webhook flips open → paid with an
 * atomic update, so Stripe's retries can never record a payment twice.
 */
type StripeSession = {
  sessionId: string;
  contactId: ObjectId;
  amount: number;
  currency: string;
  description: string;
  url: string;
  status: 'open' | 'paid';
  paymentId: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

export const CreateLinkSchema = z.object({
  contactId: z.string().refine(ObjectId.isValid, { message: 'Invalid contact' }),
  amount: z.coerce.number().positive(),
  description: z.string().trim().min(1).max(200),
});
export type CreateLinkInput = z.input<typeof CreateLinkSchema>;

export type CheckoutLink = { sessionId: string; url: string; amount: number; currency: string; description: string; status: 'open' | 'paid' };

type StripeLike = {
  checkout: { sessions: { create: Stripe['checkout']['sessions']['create'] } };
  webhooks: { constructEvent: Stripe['webhooks']['constructEvent'] };
};

let injected: StripeLike | null = null;

export class StripeService {
  /** Tests only. */
  static setClient(client: StripeLike | null): void {
    injected = client;
  }

  static isConfigured(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }

  private static client(): StripeLike {
    if (injected) return injected;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new AppError('Stripe is not configured (STRIPE_SECRET_KEY)', 503, 'NOT_CONFIGURED');
    return new Stripe(key);
  }

  private static async col() {
    return (await getDb()).collection<StripeSession>('stripe_sessions');
  }

  static async createCheckoutLink(input: CreateLinkInput, by: string, baseUrl: string): Promise<CheckoutLink> {
    requireModule('stripe');
    const data = parseInput(CreateLinkSchema, input);
    const contact = await CrmService.getContact(data.contactId);
    const currency = getConfig().currency.toLowerCase();
    const session = await this.client().checkout.sessions.create({
      mode: 'payment',
      customer_email: contact.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: { currency, unit_amount: Math.round(data.amount * 100), product_data: { name: data.description } },
        },
      ],
      metadata: { contactId: contact.id },
      success_url: `${baseUrl}/payment/success`,
      cancel_url: `${baseUrl}/payment/cancelled`,
    });
    if (!session.url) throw new AppError('Stripe did not return a checkout URL', 502, 'STRIPE');
    const now = new Date();
    await (await this.col()).insertOne({
      sessionId: session.id,
      contactId: new ObjectId(contact.id),
      amount: data.amount,
      currency,
      description: data.description,
      url: session.url,
      status: 'open',
      paymentId: null,
      createdAt: now,
      updatedAt: now,
      createdBy: by,
    });
    return { sessionId: session.id, url: session.url, amount: data.amount, currency, description: data.description, status: 'open' };
  }

  static async listLinks(): Promise<CheckoutLink[]> {
    const docs = await (await this.col()).find({}).sort({ createdAt: -1 }).limit(100).toArray();
    return docs.map((d) => ({ sessionId: d.sessionId, url: d.url, amount: d.amount, currency: d.currency, description: d.description, status: d.status }));
  }

  /** Verifies the signature and records the payment once. Returns what happened. */
  static async handleWebhook(rawBody: string, signature: string | null): Promise<'recorded' | 'duplicate' | 'ignored'> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new AppError('STRIPE_WEBHOOK_SECRET is not set', 503, 'NOT_CONFIGURED');
    if (!signature) throw new ValidationError('Missing Stripe signature');
    let event: Stripe.Event;
    try {
      event = this.client().webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new ValidationError('Invalid Stripe signature');
    }
    if (event.type !== 'checkout.session.completed') return 'ignored';
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== 'paid') return 'ignored';

    const col = await this.col();
    const claimed = await col.findOneAndUpdate(
      { sessionId: session.id, status: 'open' },
      { $set: { status: 'paid', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!claimed) return (await col.findOne({ sessionId: session.id })) ? 'duplicate' : 'ignored';

    const payment = await PaymentsService.record(
      {
        contactId: claimed.contactId.toHexString(),
        amount: (session.amount_total ?? Math.round(claimed.amount * 100)) / 100,
        method: 'stripe',
        ref: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
        description: claimed.description,
      },
      'stripe'
    );
    await col.updateOne({ sessionId: session.id }, { $set: { paymentId: new ObjectId(payment.id) } });
    return 'recorded';
  }
}
