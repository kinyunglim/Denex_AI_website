import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { setupTestDb } from '@/src/test/mongo';
import { Mailer } from '@/src/lib/email';
import { quote } from '@/src/modules/orders/pricing';
import { OrdersService, slugFor, toAnswers } from '@/src/modules/orders/orders.service';
import { OrderDao } from '@/src/modules/orders/orders.dao';
import { PaymentGateway, setGateway } from '@/src/modules/orders/payment-gateway';
import { buildOrder, processNext, Runner } from '@/src/modules/orders/production';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { AnswersSchema } from '@/src/lib/answers';
import { OrderInput } from '@/src/modules/orders/orders.model';
import { tmpdir } from 'node:os';

setupTestDb();

const input = (over: Partial<OrderInput> = {}): OrderInput => ({
  packageKey: 'business',
  addOns: ['stripe', 'logo'],
  theme: 'warm',
  locales: ['zh-Hant', 'en', 'zh-Hans'],
  business: { nameZhHant: '和動體能', nameEn: 'Harmony Move', phone: '+852 2800 1234', email: 'hello@hm.hk', address: '灣仔' },
  customer: { name: 'Joyce', email: 'joyce@hm.hk', phone: '91234567' },
  ...over,
});

function fakeGateway() {
  const gw = {
    createDepositCheckout: jest.fn(async () => ({ sessionId: 'cs_1', url: 'https://pay.test/cs_1' })),
    capture: jest.fn(async () => undefined),
    release: jest.fn(async () => undefined),
    parseWebhook: jest.fn(() => ({ type: 'authorized' as const, sessionId: 'cs_1', paymentIntentId: 'pi_1' })),
  };
  setGateway(gw as unknown as PaymentGateway);
  return gw;
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(Mailer, 'send').mockResolvedValue(undefined);
});
afterEach(() => setGateway(undefined));

describe('pricing', () => {
  it('prices a package with add-ons, dependencies and extra languages', () => {
    const q = quote('business', ['stripe', 'booking', 'logo'], 3);
    // booking is already in Business → not charged; stripe is extra; 1 extra language.
    expect(q.lines.map((l) => l.key)).toEqual(['business', 'stripe', 'logo', 'language']);
    expect(q.oneOff).toBe(16800 + 3000 + 6000 + 1500);
    expect(q.monthly).toBe(680 + 100);
    expect(q.deposit).toBe(Math.round(q.oneOff * 0.5));
    expect(q.modules.sort()).toEqual(['booking', 'payments', 'stripe']);
  });

  it('adds module dependencies automatically', () => {
    const q = quote('starter', ['gcal'], 2);
    expect(q.lines.find((l) => l.key === 'booking')?.auto).toBe(true);
    expect(q.modules.sort()).toEqual(['booking', 'gcal']);
  });

  it('rejects unknown keys', () => {
    expect(() => quote('mega', [], 1)).toThrow('Unknown package');
    expect(() => quote('starter', ['nope'], 1)).toThrow('Unknown add-on');
  });
});

describe('answers conversion', () => {
  it('produces valid answers.json for client-starter', async () => {
    setGateway(null);
    const { ref } = await OrdersService.create(input(), 'http://x');
    const order = (await OrderDao.findByRef(ref))!;
    const answers = AnswersSchema.parse(toAnswers(order));
    expect(answers.slug).toBe('harmony-move');
    expect(answers.modules.sort()).toEqual(['booking', 'payments', 'stripe']);
    expect(answers.owner).toEqual({ name: 'Joyce', email: 'joyce@hm.hk' });
    expect(slugFor({ business: { ...order.business, nameEn: '' }, ref: 'ORD-2026-0007' })).toBe('ord-2026-0007');
  });
});

describe('OrdersService without Stripe', () => {
  beforeEach(() => setGateway(null));

  it('submits, notifies, and approves without payment', async () => {
    const { ref, checkoutUrl } = await OrdersService.create(input(), 'http://x');
    expect(ref).toMatch(/^ORD-\d{4}-0001$/);
    expect(checkoutUrl).toBeNull();
    const [order] = await OrdersService.list();
    expect(order.status).toBe('submitted');
    expect(Mailer.send).toHaveBeenCalled();
    const approved = await OrdersService.approve(order.id, 'owner');
    expect(approved.status).toBe('approved');
    await expect(OrdersService.approve(order.id, 'owner')).rejects.toThrow('not waiting for review');
  });

  it('ignores honeypot submissions', async () => {
    await OrdersService.create({ ...input(), website: 'spam' }, 'http://x');
    expect(await OrdersService.list()).toHaveLength(0);
  });
});

describe('OrdersService with a Stripe deposit hold', () => {
  it('holds the deposit, captures on approval and records the payment', async () => {
    const gw = fakeGateway();
    const { ref, checkoutUrl } = await OrdersService.create(input(), 'http://site');
    expect(checkoutUrl).toBe('https://pay.test/cs_1');
    expect(gw.createDepositCheckout).toHaveBeenCalledWith(expect.objectContaining({ successUrl: `http://site/order/${ref}?paid=1` }));

    expect(await OrdersService.handleWebhook('{}', 'sig')).toBe('authorized');
    expect(await OrdersService.handleWebhook('{}', 'sig')).toBe('duplicate');
    const [order] = await OrdersService.list();
    expect(order.status).toBe('authorized');

    await OrdersService.approve(order.id, 'owner');
    expect(gw.capture).toHaveBeenCalledWith('pi_1');
    const payments = await PaymentsService.listForContact(order.contactId);
    expect(payments[0].amount).toBe(order.quote.deposit);
  });

  it('releases the hold on rejection', async () => {
    const gw = fakeGateway();
    await OrdersService.create(input(), 'http://site');
    await OrdersService.handleWebhook('{}', 'sig');
    const [order] = await OrdersService.list();
    const rejected = await OrdersService.reject(order.id, 'owner', 'Fully booked this month');
    expect(rejected.status).toBe('rejected');
    expect(gw.release).toHaveBeenCalledWith('pi_1');
    expect(gw.capture).not.toHaveBeenCalled();
  });

  it('does not approve if capture fails', async () => {
    const gw = fakeGateway();
    gw.capture.mockRejectedValueOnce(new Error('card declined'));
    await OrdersService.create(input(), 'http://site');
    await OrdersService.handleWebhook('{}', 'sig');
    const [order] = await OrdersService.list();
    await expect(OrdersService.approve(order.id, 'owner')).rejects.toThrow('card declined');
    expect((await OrdersService.get(order.id)).status).toBe('authorized');
  });
});

describe('production worker', () => {
  const paths = { starterDir: '/starter', clientsDir: '/tmp/clients-that-do-not-exist', workDir: tmpdir() };

  it('builds an approved order and marks it delivered', async () => {
    setGateway(null);
    await OrdersService.create(input(), 'http://x');
    const [o] = await OrdersService.list();
    await OrdersService.approve(o.id, 'owner');
    const run: Runner = jest.fn(async () => ({ code: 0, output: 'lots of log\n{"ok":true,"slug":"harmony-move"}' }));
    expect(await processNext(paths, 'test-worker', run)).toBe(true);
    const done = await OrdersService.get(o.id);
    expect(done.status).toBe('delivered');
    expect(done.production.dest).toContain('harmony-move');
    expect(await processNext(paths, 'test-worker', run)).toBe(false);
  });

  it('marks failures and allows a retry', async () => {
    setGateway(null);
    await OrdersService.create(input(), 'http://x');
    const [o] = await OrdersService.list();
    await OrdersService.approve(o.id, 'owner');
    const run: Runner = async () => ({ code: 1, output: '{"ok":false,"step":"verify"}' });
    await processNext(paths, 'w', run);
    const failed = await OrdersService.get(o.id);
    expect(failed.status).toBe('failed');
    expect(failed.production.error).toContain('verify');
    expect((await OrdersService.retry(o.id, 'owner')).status).toBe('approved');
  });

  it('buildOrder passes answers.json and destination to new-client', async () => {
    setGateway(null);
    await OrdersService.create(input(), 'http://x');
    const order = (await OrderDao.list())[0];
    const calls: string[][] = [];
    const run: Runner = async (_cmd, args) => {
      calls.push(args);
      return { code: 0, output: '{"ok":true}' };
    };
    const res = await buildOrder(order, paths, run);
    expect(res.ok).toBe(true);
    expect(calls[0]).toEqual(expect.arrayContaining(['--answers', '--dest']));
  });
});
