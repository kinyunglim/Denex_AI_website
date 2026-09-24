import { Mailer } from '@/src/lib/email';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import type { Order } from './orders.model';

/**
 * Order notifications: email the owner (notify.email in client.config.ts),
 * optionally the customer, and POST JSON to ORDER_WEBHOOK_URL (Slack, Discord,
 * Make, Zapier…). Never throws — a failed notification must not fail an order.
 */
export type OrderEvent = 'new' | 'authorized' | 'approved' | 'rejected' | 'delivered' | 'failed';

const OWNER_TEXT: Record<OrderEvent, string> = {
  new: '新訂單（未付訂金）New order (no deposit)',
  authorized: '新訂單，訂金已預授權 New order — deposit on hold',
  approved: '訂單已批准，開始製作 Order approved — production started',
  rejected: '訂單已拒絕 Order rejected',
  delivered: '網站已生成 Site generated',
  failed: '製作失敗 Production failed',
};

function money(n: number, currency: string): string {
  return new Intl.NumberFormat('en-HK', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

export async function notifyOrder(order: Order, event: OrderEvent, detail = ''): Promise<void> {
  const cfg = getConfig();
  const agencyName = pickLocalized(cfg.business.name, cfg.locales[0]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const name = order.business.nameZhHant || order.business.nameEn;
  const summary = [
    `${order.ref} · ${name}`,
    `Package: ${order.packageKey} · Theme: ${order.theme} · Languages: ${order.locales.join('/')}`,
    `Add-ons: ${order.addOns.join(', ') || '-'}`,
    `Total: ${money(order.quote.oneOff, order.quote.currency)} + ${money(order.quote.monthly, order.quote.currency)}/month · Deposit ${money(order.quote.deposit, order.quote.currency)}`,
    `Customer: ${order.customer.name} · ${order.customer.email} · ${order.customer.phone}`,
    detail,
    `${siteUrl}/admin/orders/${order._id?.toHexString() ?? ''}`,
  ]
    .filter(Boolean)
    .join('\n');

  const tasks: Promise<unknown>[] = [];
  if (cfg.notify.email.length) {
    tasks.push(Mailer.send({ to: cfg.notify.email, subject: `[${agencyName}] ${OWNER_TEXT[event]} — ${order.ref}`, text: summary, replyTo: order.customer.email }));
  }

  const customerLines: Partial<Record<OrderEvent, string>> = {
    new: `多謝你的訂單 ${order.ref}！我們會喺 1 個工作天內覆核並聯絡你。\nThanks for your order ${order.ref}! We'll review it within one business day.`,
    authorized: `多謝你的訂單 ${order.ref}！訂金已預留（未扣款），我們確認後先會收取。\nThanks! Your deposit for ${order.ref} is on hold and will only be charged once we confirm.`,
    approved: `訂單 ${order.ref} 已確認，我們已開始製作，預計 ${order.quote.deliveryDays} 日內交付。\nOrder ${order.ref} confirmed — production has started (about ${order.quote.deliveryDays} days).`,
    rejected: `訂單 ${order.ref} 暫時未能接受，訂金預授權已取消。${detail}\nWe can't take order ${order.ref} right now; the deposit hold has been released. ${detail}`,
  };
  const customerText = customerLines[event];
  if (customerText) {
    tasks.push(Mailer.send({ to: order.customer.email, subject: `${agencyName} — ${order.ref}`, text: customerText }));
  }

  const hook = process.env.ORDER_WEBHOOK_URL;
  if (hook) {
    tasks.push(
      fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `text` + `content` so Slack and Discord both render it.
        body: JSON.stringify({ event, ref: order.ref, status: order.status, text: `${OWNER_TEXT[event]}\n${summary}`, content: `${OWNER_TEXT[event]}\n${summary}` }),
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) if (r.status === 'rejected') console.error('[Orders] Notification failed:', r.reason);
}
