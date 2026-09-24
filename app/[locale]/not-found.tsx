import { getTranslations } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('common');
  return (
    <section className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-4xl text-ink">{t('notFoundTitle')}</h1>
      <p className="mt-4 text-muted">{t('notFoundBody')}</p>
      <Link href="/" className="btn-primary mt-8">
        {t('home')}
      </Link>
    </section>
  );
}
