import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { setupTestDb } from '@/src/test/mongo';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { StripeService } from '@/src/modules/stripe/stripe.service';
import { CrmService } from '@/src/modules/crm/crm.service';
import { getConfig, resetConfigCache } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import clientConfig from '@/client.config';

setupTestDb();

describe('PaymentsService', () => {
  it('records payments with sequential receipt numbers per year', async () => {
    const c = await CrmService.createContact({ name: 'A', phone: '91234567' }, 'admin');
    const p1 = await PaymentsService.record({ contactId: c.id, amount: 800, method: 'fps', paidAt: '2026-03-01' }, 'owner');
    const p2 = await PaymentsService.record({ contactId: c.id, amount: 650.456, method: 'cash', paidAt: '2026-03-02' }, 'owner');
    const p3 = await PaymentsService.record({ contactId: c.id, amount: 100, method: 'cash', paidAt: '2027-01-02' }, 'owner');
    expect([p1.receiptNo, p2.receiptNo, p3.receiptNo]).toEqual(['R-2026-0001', 'R-2026-0002', 'R-2027-0001']);
    expect(p2.amount).toBe(650.46);
    expect(p1.currency).toBe('HKD');
    expect(await PaymentsService.total(new Date('2026-01-01'), new Date('2027-01-01'))).toBe(1450.46);
  });

  it('builds a receipt with business and contact details', async () => {
    const c = await CrmService.createContact({ name: 'Mandy', email: 'm@x.com' }, 'admin');
    const p = await PaymentsService.record({ contactId: c.id, amount: 280, method: 'card', description: 'Yoga' }, 'owner');
    const r = await PaymentsService.receipt(p.id);
    expect(r.contactName).toBe('Mandy');
    expect(r.business.name).toBe(pickLocalized(getConfig().business.name, getConfig().locales[0]));
  });

  it('rejects unknown contacts and bad amounts', async () => {
    await expect(PaymentsService.record({ contactId: '6566a7e1c2b3a4d5e6f70812', amount: 1, method: 'cash' }, 'o')).rejects.toThrow('Contact not found');
    const c = await CrmService.createContact({ name: 'A', phone: '91234567' }, 'admin');
    await expect(PaymentsService.record({ contactId: c.id, amount: 0, method: 'cash' }, 'o')).rejects.toThrow('Invalid input');
  });
});

describe('StripeService', () => {
  const cfg = clientConfig as { modules: Record<string, boolean> };
  const original = { ...cfg.modules };

  beforeEach(() => {
    cfg.modules.stripe = true;
    cfg.modules.payments = true;
    resetConfigCache();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  });

  afterEach(() => {
    cfg.modules = { ...original };
    StripeService.setClient(null);
    resetConfigCache();
  });

  function fakeStripe(event: unknown) {
    const create = jest.fn(async () => ({ id: 'cs_1', url: 'https://checkout.stripe.test/cs_1' }));
    const constructEvent = jest.fn((_b: string, sig: string) => {
      if (sig !== 'good') throw new Error('bad sig');
      return event;
    });
    StripeService.setClient({ checkout: { sessions: { create } }, webhooks: { constructEvent } } as never);
    return { create, constructEvent };
  }

  it('creates a checkout link and records the payment exactly once', async () => {
    const c = await CrmService.createContact({ name: 'A', email: 'a@x.com' }, 'admin');
    const event = {
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1', payment_status: 'paid', amount_total: 80000, payment_intent: 'pi_1' } },
    };
    const { create } = fakeStripe(event);
    const link = await StripeService.createCheckoutLink({ contactId: c.id, amount: 800, description: 'Package' }, 'owner', 'https://site.test');
    expect(link.url).toContain('cs_1');
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ customer_email: 'a@x.com' }));

    expect(await StripeService.handleWebhook('{}', 'good')).toBe('recorded');
    expect(await StripeService.handleWebhook('{}', 'good')).toBe('duplicate');
    const payments = await PaymentsService.listForContact(c.id);
    expect(payments).toHaveLength(1);
    expect(payments[0]).toEqual(expect.objectContaining({ amount: 800, method: 'stripe', ref: 'pi_1' }));
    expect((await StripeService.listLinks())[0].status).toBe('paid');
  });

  it('rejects bad signatures and ignores other events', async () => {
    fakeStripe({ type: 'payment_intent.created', data: { object: {} } });
    await expect(StripeService.handleWebhook('{}', 'bad')).rejects.toThrow('Invalid Stripe signature');
    await expect(StripeService.handleWebhook('{}', null)).rejects.toThrow('Missing Stripe signature');
    expect(await StripeService.handleWebhook('{}', 'good')).toBe('ignored');
  });

  it('refuses to create links when the module is off', async () => {
    cfg.modules.stripe = false;
    resetConfigCache();
    fakeStripe({});
    await expect(StripeService.createCheckoutLink({ contactId: '6566a7e1c2b3a4d5e6f70812', amount: 1, description: 'x' }, 'o', 'http://x')).rejects.toThrow('not enabled');
  });
});
