import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { agency } from '@/agency.config';
import { copy, langOf } from '@/src/components/agency/home-copy';
import { Shot } from '@/src/components/agency/visuals';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agency');
  return { title: t('templatesTitle') };
}

/** All styles: real screenshots (hover scrolls the page), each opening its preview page. */
export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agency');
  const lang = langOf(locale);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="section-title">{t('templatesTitle')}</h1>
      <p className="mt-3 max-w-2xl text-muted">{copy.preview.note[lang]}</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {agency.themes.map((theme) => (
          <article key={theme.key} className="card group overflow-hidden">
            <Link href={`/templates/${theme.key}`} className="relative block h-[360px] overflow-hidden border-b border-line bg-surface-alt">
              <Shot theme={theme.key} alt={theme.name[lang]} scroll />
              <span className="absolute bottom-4 right-4 rounded-button bg-primary px-4 py-2 text-sm text-on-primary shadow-card">
                {copy.gallery.preview[lang]} →
              </span>
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-xl text-ink">{theme.name[lang]}</h2>
                <p className="mt-1 text-sm text-muted">{t('fit')}: {theme.fit[lang]}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/templates/${theme.key}`} className="btn-ghost !py-2">{copy.gallery.preview[lang]}</Link>
                <Link href={`/order?theme=${theme.key}`} className="btn-primary !py-2">{t('choose')}</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
