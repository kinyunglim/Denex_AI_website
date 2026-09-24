import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { agency } from '@/agency.config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agency');
  return { title: t('templatesTitle') };
}

type Lang = 'zh-Hant' | 'en';

/** Live previews of each client-starter theme (iframes of the preview deployment). */
export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agency');
  const lang: Lang = locale === 'en' ? 'en' : 'zh-Hant';
  const previewLocale = locale === 'en' ? 'en' : 'zh-Hant';
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl text-ink">{t('templatesTitle')}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t('templatesSub')}</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {agency.themes.map((theme) => {
          const src = `${agency.previewBaseUrl}/${previewLocale}?theme=${theme.key}`;
          const full = `${src}&order=${encodeURIComponent(`${site}/${locale}/order`)}`;
          return (
            <article key={theme.key} className="card overflow-hidden">
              <div className="relative h-[420px] overflow-hidden border-b border-line bg-surface-alt">
                {/* Rendered at desktop width and scaled down so the preview looks like a real browser window. */}
                <iframe
                  src={src}
                  title={theme.name[lang]}
                  loading="lazy"
                  className="pointer-events-auto absolute left-0 top-0 h-[840px] w-[200%] origin-top-left scale-50 border-0"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <h2 className="text-xl text-ink">{theme.name[lang]}</h2>
                  <p className="mt-1 text-sm text-muted">{t('fit')}: {theme.fit[lang]}</p>
                </div>
                <div className="flex gap-2">
                  <a href={full} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2">{t('openFull')} ↗</a>
                  <Link href={`/order?theme=${theme.key}`} className="btn-primary !py-2">{t('choose')}</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
