import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { agency } from '@/agency.config';
import { OrderForm } from '@/src/components/agency/OrderForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agency');
  return { title: t('orderTitle') };
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ theme?: string; package?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('agency');
  const theme = agency.themes.some((x) => x.key === sp.theme) ? sp.theme! : 'warm';
  const pkg = agency.packages.some((x) => x.key === sp.package) ? sp.package! : 'business';
  const withStripe = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl text-ink">{t('orderTitle')}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t('orderSub')}</p>
      <div className="mt-10">
        <OrderForm initialTheme={theme} initialPackage={pkg} withDeposit={withStripe} previewBaseUrl={agency.previewBaseUrl} />
      </div>
    </section>
  );
}
