import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { requireModulePage } from '@/src/lib/modules';
import { getConfig } from '@/src/lib/site';
import { BookingWizard } from '@/src/components/site/BookingWizard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('booking');
  return { title: t('title') };
}

export default async function BookPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  requireModulePage('booking');
  const t = await getTranslations('booking');
  const cfg = getConfig();

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl text-ink">{t('title')}</h1>
      <p className="mt-3 text-muted">{t('subtitle')}</p>
      <div className="mt-10">
        <BookingWizard timezone={cfg.timezone} currency={cfg.currency} maxDaysAhead={cfg.booking.maxDaysAhead} />
      </div>
    </section>
  );
}
