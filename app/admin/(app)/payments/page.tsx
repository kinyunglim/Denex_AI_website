import Link from 'next/link';
import { requireAdminPage } from '@/src/lib/admin-session';
import { requireModulePage, isEnabled } from '@/src/lib/modules';
import { getAdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { fmtDate, fmtMoney } from '@/src/lib/admin-format';
import { toZonedDateStr, zonedDateAtMinutes } from '@/src/lib/time';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { StripeService } from '@/src/modules/stripe/stripe.service';
import { CrmService } from '@/src/modules/crm/crm.service';
import { Badge, Empty, PageHeader, Panel, Stat, Table } from '@/src/components/admin/ui';

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  requireModulePage('payments');
  await requireAdminPage('owner');
  const { month } = await searchParams;
  const t = await getAdminT();
  const tz = getConfig().timezone;
  const current = /^\d{4}-\d{2}$/.test(month ?? '') ? (month as string) : toZonedDateStr(new Date(), tz).slice(0, 7);
  const [y, m] = current.split('-').map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  const from = zonedDateAtMinutes(`${current}-01`, 0, tz);
  const to = zonedDateAtMinutes(`${next}-01`, 0, tz);

  const [payments, total, links] = await Promise.all([
    PaymentsService.listRange(from, to),
    PaymentsService.total(from, to),
    isEnabled('stripe') ? StripeService.listLinks() : Promise.resolve([]),
  ]);
  const names = new Map((await Promise.all([...new Set(payments.map((p) => p.contactId))].map((id) => CrmService.getContact(id).catch(() => null)))).filter((c) => c !== null).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('payments')}
        actions={
          <>
            <Link href={`?month=${prev}`} className="btn-ghost !py-2">←</Link>
            <span className="self-center text-sm text-ink">{current}</span>
            <Link href={`?month=${next}`} className="btn-ghost !py-2">→</Link>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label={`${t('total')} ${current}`} value={fmtMoney(total)} />
        <Stat label={t('payments')} value={payments.length} />
      </div>
      <Panel>
        {payments.length === 0 ? (
          <Empty>{t('none')}</Empty>
        ) : (
          <Table head={[t('paidAt'), t('contact'), t('amount'), t('method'), t('description'), t('receipt')]}>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2 text-muted">{fmtDate(p.paidAt)}</td>
                <td className="px-3 py-2"><Link href={`/admin/contacts/${p.contactId}`} className="text-ink hover:text-primary">{names.get(p.contactId) ?? '—'}</Link></td>
                <td className="px-3 py-2 font-semibold text-ink">{fmtMoney(p.amount)}</td>
                <td className="px-3 py-2"><Badge tone="muted">{p.method}</Badge></td>
                <td className="px-3 py-2 text-muted">{p.description}</td>
                <td className="px-3 py-2"><Link href={`/admin/payments/${p.id}/receipt`} className="text-primary">{p.receiptNo}</Link></td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
      {isEnabled('stripe') && (
        <Panel title={t('stripeLinks')}>
          {links.length === 0 ? (
            <Empty>{t('none')}</Empty>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {links.map((l) => (
                <li key={l.sessionId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="text-ink">{l.description} · {fmtMoney(l.amount)}</span>
                  <span className="flex items-center gap-2">
                    <Badge tone={l.status === 'paid' ? 'primary' : 'muted'}>{l.status === 'paid' ? t('paid') : t('unpaid')}</Badge>
                    {l.status === 'open' && <a href={l.url} target="_blank" rel="noreferrer" className="text-primary">{t('copy')} ↗</a>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
