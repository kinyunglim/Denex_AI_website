import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';

/** Stripe Checkout return pages: /payment/success and /payment/cancelled. */
export default async function PaymentResultPage({ params }: { params: Promise<{ locale: string; result: string }> }) {
  const { locale, result } = await params;
  setRequestLocale(locale);
  if (result !== 'success' && result !== 'cancelled') notFound();
  const t = await getTranslations('payment');
  const ok = result === 'success';
  return (
    <section className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-4xl text-ink">{ok ? t('successTitle') : t('cancelledTitle')}</h1>
      <p className="mt-4 text-muted">{ok ? t('successBody') : t('cancelledBody')}</p>
      <Link href="/" className="btn-primary mt-8">{t('home')}</Link>
    </section>
  );
}
