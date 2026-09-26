import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { agency } from '@/agency.config';
import { OrderForm } from '@/src/components/agency/OrderForm';
import { isShowcaseMode } from '@/src/lib/site';

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
      {isShowcaseMode() && (
        <p className="mt-6 max-w-2xl rounded-card border border-accent/40 bg-surface-alt px-5 py-4 text-sm text-ink" role="note">
          {locale === 'en'
            ? 'Demo version: you can explore plans and prices, but online ordering is not open yet. Please use the contact form to order.'
            : '示範版本：可以試揀方案同計價錢，但暫時未開放網上落單。想落單請用聯絡表單搵我哋。'}
        </p>
      )}
      <div className="mt-10">
        <OrderForm initialTheme={theme} initialPackage={pkg} withDeposit={withStripe} />
      </div>
    </section>
  );
}
