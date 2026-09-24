import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { OrdersService } from '@/src/modules/orders/orders.service';
import { agency } from '@/agency.config';

/** Customer-facing order status (only non-sensitive fields). */
export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; ref: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const { locale, ref } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  if (!/^ORD-\d{4}-\d{4}$/.test(ref)) notFound();
  const status = await OrdersService.publicStatus(ref);
  if (!status) notFound();
  const t = await getTranslations('agency');
  const lang = locale === 'en' ? 'en' : 'zh-Hant';
  const pkg = agency.packages.find((p) => p.key === status.packageKey);
  const money = new Intl.NumberFormat(locale === 'en' ? 'en-HK' : 'zh-HK', { style: 'currency', currency: status.currency, maximumFractionDigits: 0 });

  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl text-ink">{t('statusTitle', { ref: status.ref })}</h1>
      {sp.paid && <p className="mt-4 text-primary">{t('paidNote')}</p>}
      {sp.cancelled && <p className="mt-4 text-muted">{t('cancelledNote')}</p>}
      <p className="card mt-8 p-6 text-lg text-ink" role="status">{t(`statusLabels.${status.status}`)}</p>
      <dl className="mt-6 space-y-1 text-sm text-muted">
        <div>{pkg?.name[lang]} · {status.theme}</div>
        <div>{money.format(status.oneOff)} + {money.format(status.monthly)}{t('perMonth')}</div>
        <div>{t('delivery', { n: status.deliveryDays })}</div>
      </dl>
      <Link href="/" className="btn-ghost mt-10">{t('backHome')}</Link>
    </section>
  );
}
