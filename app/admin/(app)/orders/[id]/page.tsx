import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/src/lib/admin-session';
import { getAdminT } from '@/src/lib/admin-i18n';
import { fmtDateTime, fmtMoney } from '@/src/lib/admin-format';
import { holdAgeDays, OrdersService } from '@/src/modules/orders/orders.service';
import { ActionButton } from '@/src/components/admin/ActionButton';
import { ActionForm } from '@/src/components/admin/ActionForm';
import { Badge, PageHeader, Panel } from '@/src/components/admin/ui';
import { approveOrderAction, rejectOrderAction, retryOrderAction } from '../actions';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage('owner');
  const { id } = await params;
  const order = await OrdersService.get(id).catch(() => null);
  if (!order) notFound();
  const t = await getAdminT();
  const reviewable = order.status === 'submitted' || order.status === 'authorized';
  const holdDays = holdAgeDays(order.history);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${order.ref} · ${order.business.nameZhHant || order.business.nameEn}`}
        actions={
          <>
            <Badge tone="primary">{order.status}</Badge>
            <a href={`/admin/orders/${order.id}/answers`} className="btn-ghost !py-2">{t('answersJson')}</a>
          </>
        }
      />

      {reviewable && (
        <Panel>
          {order.status === 'authorized' && holdDays >= 4 && <p className="mb-3 text-sm text-primary">{t('holdAge').replace('{d}', String(holdDays))}</p>}
          <div className="flex flex-wrap items-start gap-6">
            <ActionButton action={approveOrderAction.bind(null, order.id)} label={`${t('approve')}${order.status === 'authorized' ? ` (${fmtMoney(order.quote.deposit)})` : ''}`} confirm={`${t('approve')}?`} className="btn-primary" />
            <ActionForm action={rejectOrderAction.bind(null, order.id)} submitLabel={t('reject')} submitClassName="btn-ghost" className="flex flex-wrap items-end gap-2" confirm={`${t('reject')}?`}>
              <input name="reason" placeholder={t('rejectReason')} className="field w-72" />
            </ActionForm>
          </div>
          <p className="mt-4 text-xs text-muted">{t('workerHint')}</p>
        </Panel>
      )}

      {order.status === 'failed' && (
        <Panel>
          <p className="mb-3 text-sm text-primary">{order.production.error}</p>
          <ActionButton action={retryOrderAction.bind(null, order.id)} label={t('retry')} className="btn-primary" />
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title={t('package')}>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-muted">{t('package')} · {t('theme')}</dt><dd className="text-ink">{order.packageKey} · {order.theme}</dd></div>
            <div><dt className="text-muted">{t('languages')}</dt><dd className="text-ink">{order.locales.join(' / ')}</dd></div>
            <div><dt className="text-muted">Modules</dt><dd className="text-ink">{order.quote.modules.join(', ') || '—'}</dd></div>
          </dl>
          <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
            {order.quote.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-2"><span className="text-ink">{l.name['zh-Hant']}{l.qty > 1 ? ` ×${l.qty}` : ''}</span><span className="text-muted">{fmtMoney(l.oneOff)}{l.monthly ? ` +${fmtMoney(l.monthly)}` : ''}</span></li>
            ))}
            <li className="flex justify-between border-t border-line pt-2 font-semibold"><span>{t('oneOffFee')}</span><span>{fmtMoney(order.quote.oneOff)}</span></li>
            <li className="flex justify-between"><span>{t('monthlyFee')}</span><span>{fmtMoney(order.quote.monthly)}</span></li>
            <li className="flex justify-between text-muted"><span>{t('depositHeld')}</span><span>{fmtMoney(order.quote.deposit)}</span></li>
          </ul>
        </Panel>

        <Panel title={t('business')}>
          <dl className="space-y-1 text-sm text-ink">
            <div>{order.business.nameZhHant} {order.business.nameEn && `· ${order.business.nameEn}`}</div>
            <div className="text-muted">{order.business.industry}</div>
            <div>{order.business.phone} {order.business.whatsapp && `· WhatsApp ${order.business.whatsapp}`}</div>
            <div>{order.business.email}</div>
            <div>{order.business.address}</div>
            <div>{order.business.domain}</div>
          </dl>
          <h3 className="mt-5 text-sm font-semibold text-ink">{t('customer')}</h3>
          <p className="text-sm text-ink">
            <Link href={`/admin/contacts/${order.contactId}`} className="hover:text-primary">{order.customer.name}</Link> · {order.customer.email} · {order.customer.phone}
          </p>
          {order.notes && <p className="mt-3 whitespace-pre-line rounded-input bg-surface-alt p-3 text-sm text-ink">{order.notes}</p>}
        </Panel>

        <Panel title={t('history')}>
          <ol className="space-y-2 text-sm">
            {order.history.map((h, i) => (
              <li key={i}><Badge tone="muted">{h.status}</Badge> <span className="text-muted">{fmtDateTime(h.at)} · {h.by}</span>{h.note && <span className="block text-ink">{h.note}</span>}</li>
            ))}
          </ol>
        </Panel>
      </div>

      {(order.production.startedAt || order.production.dest) && (
        <Panel title={t('productionLog')}>
          {order.production.dest && <p className="mb-3 text-sm text-ink">{t('repo')}: <code>{order.production.dest}</code></p>}
          {order.status === 'delivered' && (
            <div className="mb-4 rounded-input bg-surface-alt p-4 text-sm text-ink">
              <p className="font-semibold">{t('goLive')}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>content/*.json — replace demo copy with the client&apos;s text (/new-client skill step 5)</li>
                <li>MongoDB Atlas project + Vercel project (docs/SETUP.md)</li>
                <li>Env vars → deploy → domain {order.business.domain}</li>
                <li>corepack yarn admin:create --email {order.customer.email} --name &quot;{order.customer.name}&quot;</li>
                <li>docs/HANDOVER.md → send to the client</li>
              </ol>
            </div>
          )}
          <pre className="max-h-96 overflow-auto rounded-input bg-ink p-4 text-xs text-bg">{order.production.log || '…'}</pre>
        </Panel>
      )}
    </div>
  );
}
