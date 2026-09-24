import { ObjectId, WithId } from 'mongodb';
import { parseInput } from '@/src/lib/api';
import { AppError, ConflictError, NotFoundError } from '@/src/lib/errors';
import { CrmService } from '@/src/modules/crm/crm.service';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { AnswersInput } from '@/src/lib/answers';
import { agency } from '@/agency.config';
import { quote } from './pricing';
import { OrderDao } from './orders.dao';
import { Order, OrderInput, OrderInputSchema, OrderStatus, OrderSummary } from './orders.model';
import { getGateway } from './payment-gateway';
import { notifyOrder } from './notify';

export type CreatedOrder = { ref: string; checkoutUrl: string | null };

const REVIEWABLE: OrderStatus[] = ['submitted', 'authorized'];

export function toSummary(o: WithId<Order>): OrderSummary {
  return {
    id: o._id.toHexString(),
    ref: o.ref,
    packageKey: o.packageKey,
    addOns: o.addOns,
    theme: o.theme,
    locales: o.locales,
    business: o.business,
    customer: o.customer,
    notes: o.notes,
    contactId: o.contactId.toHexString(),
    quote: o.quote,
    status: o.status,
    checkoutUrl: o.stripe.checkoutUrl,
    paymentIntentId: o.stripe.paymentIntentId,
    production: {
      startedAt: o.production.startedAt?.toISOString() ?? null,
      finishedAt: o.production.finishedAt?.toISOString() ?? null,
      dest: o.production.dest,
      log: o.production.log,
      error: o.production.error,
    },
    history: o.history.map((h) => ({ ...h, at: h.at.toISOString() })),
    createdAt: o.createdAt.toISOString(),
  };
}

/** Whole days since the deposit was authorised (Stripe releases holds after ~7 days). */
export function holdAgeDays(history: { at: string; status: OrderStatus }[], now: Date = new Date()): number {
  const at = history.find((h) => h.status === 'authorized')?.at;
  return at ? Math.floor((now.getTime() - new Date(at).getTime()) / 86_400_000) : 0;
}

/** A URL-safe slug from the English (or Chinese→ref) business name. */
export function slugFor(o: Pick<Order, 'business' | 'ref'>): string {
  const base = o.business.nameEn
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/g, '');
  return base || o.ref.toLowerCase();
}

/** Converts an order into the answers.json consumed by client-starter's new-client script. */
export function toAnswers(o: Order): AnswersInput {
  return {
    slug: slugFor(o),
    business: {
      name: {
        ...(o.business.nameZhHant ? { 'zh-Hant': o.business.nameZhHant } : {}),
        ...(o.business.nameEn ? { en: o.business.nameEn } : {}),
      },
      phone: o.business.phone,
      whatsapp: o.business.whatsapp,
      email: o.business.email,
      address: o.locales.includes('en') && !o.locales.includes('zh-Hant') ? { en: o.business.address } : { 'zh-Hant': o.business.address },
    },
    locales: o.locales,
    theme: o.theme,
    modules: o.quote.modules,
    notifyEmails: o.business.email ? [o.business.email] : [o.customer.email],
    owner: { name: o.customer.name, email: o.customer.email },
    ...(o.business.domain ? { domain: o.business.domain } : {}),
  };
}

/**
 * Agency orders: create (optionally with a Stripe deposit hold), review
 * (approve = capture, reject = release), and production bookkeeping for the worker.
 */
export class OrdersService {
  static async create(input: OrderInput, baseUrl: string): Promise<CreatedOrder> {
    const data = parseInput(OrderInputSchema, input);
    if (data.website) return { ref: 'ORD-0000-0000', checkoutUrl: null };

    // Business name must exist in the site's default (first) language.
    if (data.locales[0] === 'en' && !data.business.nameEn) data.business.nameEn = data.business.nameZhHant;
    if (data.locales[0] !== 'en' && !data.business.nameZhHant) data.business.nameZhHant = data.business.nameEn;

    const q = quote(data.packageKey, data.addOns, data.locales.length);
    const { contact } = await CrmService.findOrCreateContact({
      name: data.customer.name,
      email: data.customer.email,
      phone: data.customer.phone,
      tags: ['order', data.packageKey],
      source: 'form',
    });

    const now = new Date();
    const ref = await OrderDao.nextRef(now.getUTCFullYear());
    const gateway = q.deposit > 0 ? getGateway() : null;
    const status: OrderStatus = gateway ? 'awaiting_payment' : 'submitted';
    const order: Order = {
      ref,
      packageKey: data.packageKey,
      addOns: data.addOns,
      theme: data.theme,
      locales: data.locales,
      business: { ...data.business, email: data.business.email ?? '' },
      customer: data.customer,
      notes: data.notes,
      contactId: new ObjectId(contact.id),
      quote: q,
      status,
      stripe: { sessionId: null, paymentIntentId: null, checkoutUrl: null },
      production: { startedAt: null, finishedAt: null, dest: null, log: '', error: null },
      history: [{ at: now, status, by: 'customer' }],
      createdAt: now,
      updatedAt: now,
      createdBy: 'customer',
    };
    const id = await OrderDao.insertOne(order);

    if (!gateway) {
      await notifyOrder({ ...order, _id: id }, 'new');
      return { ref, checkoutUrl: null };
    }

    const checkout = await gateway.createDepositCheckout({
      ref,
      amount: q.deposit,
      currency: q.currency,
      description: `${ref} deposit / 訂金`,
      customerEmail: data.customer.email,
      successUrl: `${baseUrl}/order/${ref}?paid=1`,
      cancelUrl: `${baseUrl}/order/${ref}?cancelled=1`,
    });
    await OrderDao.update(id, { $set: { 'stripe.sessionId': checkout.sessionId, 'stripe.checkoutUrl': checkout.url } });
    return { ref, checkoutUrl: checkout.url };
  }

  static async handleWebhook(rawBody: string, signature: string | null): Promise<string> {
    const gateway = getGateway();
    if (!gateway) throw new AppError('Stripe is not configured', 503, 'NOT_CONFIGURED');
    const event = gateway.parseWebhook(rawBody, signature);
    if (event.type === 'ignored') return 'ignored';
    const order = await OrderDao.findBySession(event.sessionId);
    if (!order) return 'unknown-session';
    if (event.type === 'expired') {
      await OrderDao.transition(order._id, ['awaiting_payment'], 'expired', 'stripe');
      return 'expired';
    }
    const updated = await OrderDao.transition(order._id, ['awaiting_payment'], 'authorized', 'stripe', {
      stripe: { ...order.stripe, paymentIntentId: event.paymentIntentId },
    });
    if (!updated) return 'duplicate';
    await notifyOrder(updated, 'authorized');
    return 'authorized';
  }

  static async approve(id: string, by: string): Promise<OrderSummary> {
    const order = await OrderDao.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    if (!REVIEWABLE.includes(order.status)) throw new ConflictError(`Order is ${order.status}, not waiting for review`);

    if (order.status === 'authorized' && order.stripe.paymentIntentId) {
      const gateway = getGateway();
      if (!gateway) throw new AppError('Stripe is not configured', 503, 'NOT_CONFIGURED');
      await gateway.capture(order.stripe.paymentIntentId);
    }
    const updated = await OrderDao.transition(order._id, REVIEWABLE, 'approved', by);
    if (!updated) throw new ConflictError('Order was changed by someone else — refresh and try again');

    if (order.status === 'authorized') {
      await PaymentsService.record(
        {
          contactId: order.contactId.toHexString(),
          amount: order.quote.deposit,
          method: 'stripe',
          ref: order.stripe.paymentIntentId ?? '',
          description: `${order.ref} deposit / 訂金`,
        },
        by
      ).catch((error) => console.error('[Orders] Could not record deposit payment:', error));
    }
    await notifyOrder(updated, 'approved');
    return toSummary(updated);
  }

  static async reject(id: string, by: string, reason: string): Promise<OrderSummary> {
    const order = await OrderDao.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    const rejectable: OrderStatus[] = ['submitted', 'authorized', 'awaiting_payment'];
    if (!rejectable.includes(order.status)) throw new ConflictError(`Order is ${order.status} and can no longer be rejected`);
    if (order.status === 'authorized' && order.stripe.paymentIntentId) {
      await getGateway()?.release(order.stripe.paymentIntentId);
    }
    const updated = await OrderDao.transition(order._id, rejectable, 'rejected', by, {}, reason);
    if (!updated) throw new ConflictError('Order was changed by someone else — refresh and try again');
    await notifyOrder(updated, 'rejected', reason);
    return toSummary(updated);
  }

  static async retry(id: string, by: string): Promise<OrderSummary> {
    const order = await OrderDao.findById(id);
    if (!order) throw new NotFoundError('Order not found');
    const updated = await OrderDao.transition(order._id, ['failed'], 'approved', by, {}, 'retry');
    if (!updated) throw new ConflictError('Only failed orders can be retried');
    return toSummary(updated);
  }

  // ----- worker bookkeeping -----
  static async claimNext(worker: string): Promise<WithId<Order> | null> {
    return OrderDao.claimNextApproved(worker);
  }

  static async finish(order: WithId<Order>, ok: boolean, dest: string | null, log: string, error: string | null): Promise<void> {
    const trimmed = log.length > 20000 ? `…${log.slice(-20000)}` : log;
    const updated = await OrderDao.transition(order._id, ['in_production'], ok ? 'delivered' : 'failed', 'worker', {
      production: { startedAt: order.production.startedAt, finishedAt: new Date(), dest, log: trimmed, error },
    });
    if (updated) await notifyOrder(updated, ok ? 'delivered' : 'failed', ok ? `Repo: ${dest}` : `Error: ${error}`);
  }

  // ----- reads -----
  static async list(statuses?: OrderStatus[]): Promise<OrderSummary[]> {
    return (await OrderDao.list(statuses)).map(toSummary);
  }

  static async get(id: string): Promise<OrderSummary> {
    const o = await OrderDao.findById(id);
    if (!o) throw new NotFoundError('Order not found');
    return toSummary(o);
  }

  static async getRaw(id: string): Promise<WithId<Order>> {
    const o = await OrderDao.findById(id);
    if (!o) throw new NotFoundError('Order not found');
    return o;
  }

  /** What the customer may see on their status page. */
  static async publicStatus(ref: string): Promise<{ ref: string; status: OrderStatus; packageKey: string; theme: string; oneOff: number; monthly: number; deposit: number; currency: string; deliveryDays: number } | null> {
    const o = await OrderDao.findByRef(ref);
    if (!o) return null;
    return { ref: o.ref, status: o.status, packageKey: o.packageKey, theme: o.theme, oneOff: o.quote.oneOff, monthly: o.quote.monthly, deposit: o.quote.deposit, currency: o.quote.currency, deliveryDays: o.quote.deliveryDays };
  }

  static async countNeedingReview(): Promise<number> {
    return OrderDao.countByStatus(REVIEWABLE);
  }

  static depositRate(): number {
    return agency.depositRate;
  }
}
