import Link from 'next/link';
import { requireAdminPage } from '@/src/lib/admin-session';
import { getAdminT } from '@/src/lib/admin-i18n';
import { fmtDateTime, fmtMoney } from '@/src/lib/admin-format';
import { OrdersService } from '@/src/modules/orders/orders.service';
import { OrderStatus } from '@/src/modules/orders/orders.model';
import { Badge, Empty, PageHeader, Panel, Table } from '@/src/components/admin/ui';

const REVIEW: OrderStatus[] = ['submitted', 'authorized'];

export default async function OrdersPage() {
  await requireAdminPage('owner');
  const t = await getAdminT();
  const orders = await OrdersService.list();
  const review = orders.filter((o) => REVIEW.includes(o.status));

  const row = (o: (typeof orders)[number]) => (
    <tr key={o.id} className="hover:bg-surface-alt">
      <td className="px-3 py-2"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-ink hover:text-primary">{o.ref}</Link></td>
      <td className="px-3 py-2 text-ink">{o.business.nameZhHant || o.business.nameEn}</td>
      <td className="px-3 py-2 text-muted">{o.packageKey} · {o.theme}</td>
      <td className="px-3 py-2 text-ink">{fmtMoney(o.quote.oneOff)} <span className="text-muted">+ {fmtMoney(o.quote.monthly)}</span></td>
      <td className="px-3 py-2"><Badge tone={REVIEW.includes(o.status) ? 'primary' : 'muted'}>{o.status}</Badge></td>
      <td className="px-3 py-2 text-muted">{fmtDateTime(o.createdAt)}</td>
    </tr>
  );
  const head = ['#', t('business'), `${t('package')} · ${t('theme')}`, `${t('oneOffFee')} + ${t('monthlyFee')}`, t('orderStatus'), t('created')];

  return (
    <div className="space-y-6">
      <PageHeader title={t('orders')} />
      <Panel title={`${t('needsReview')} (${review.length})`}>
        {review.length === 0 ? <Empty>{t('none')}</Empty> : <Table head={head}>{review.map(row)}</Table>}
      </Panel>
      <Panel title={t('all')}>
        {orders.length === 0 ? <Empty>{t('none')}</Empty> : <Table head={head}>{orders.map(row)}</Table>}
      </Panel>
    </div>
  );
}
