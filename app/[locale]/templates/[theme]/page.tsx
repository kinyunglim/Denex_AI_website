import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { agency } from '@/agency.config';
import { copy, langOf } from '@/src/components/agency/home-copy';
import { TemplatePreview } from '@/src/components/agency/TemplatePreview';
import { Icon, Shot } from '@/src/components/agency/visuals';

type Params = Promise<{ locale: string; theme: string }>;

export function generateStaticParams() {
  return agency.themes.map((t) => ({ theme: t.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, theme } = await params;
  const t = agency.themes.find((x) => x.key === theme);
  return { title: t ? t.name[langOf(locale)] : undefined };
}

/** One template: full-page screenshot (desktop / mobile), what's included, choose button. */
export default async function TemplatePage({ params }: { params: Params }) {
  const { locale, theme } = await params;
  setRequestLocale(locale);
  const t = agency.themes.find((x) => x.key === theme);
  if (!t) notFound();
  const lang = langOf(locale);
  const c = copy.preview;
  // Live demo only when a preview deployment is configured (see README).
  const liveBase = process.env.NEXT_PUBLIC_PREVIEW_BASE_URL;
  const liveUrl = liveBase ? `${liveBase}/${lang}?theme=${t.key}` : null;
  const others = agency.themes.filter((x) => x.key !== t.key);

  return (
    <>
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link href="/templates" className="text-sm text-muted hover:text-primary">{c.back[lang]}</Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="section-title">{t.name[lang]}</h1>
              <p className="mt-2 text-muted">{c.fit[lang]}：{t.fit[lang]}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {liveUrl && (
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !border-primary !px-6 !text-primary">
                  {c.live[lang]} ↗
                </a>
              )}
              <Link href={`/order?theme=${t.key}`} className="btn-primary btn-offset !px-7">
                {c.choose[lang]} <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">{c.note[lang]}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_240px]">
        <TemplatePreview theme={t.key} alt={t.name[lang]} labels={{ desktop: c.desktop[lang], mobile: c.mobile[lang] }} />
        <aside className="space-y-8 lg:pt-16">
          <div>
            <h2 className="heading text-lg text-ink">{c.includes[lang]}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {c.list.map((item) => (
                <li key={item.en} className="flex gap-2">
                  <span className="text-accent">✓</span>
                  {item[lang]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="heading text-lg text-ink">{c.others[lang]}</h2>
            <ul className="mt-4 space-y-4">
              {others.map((o) => (
                <li key={o.key}>
                  <Link href={`/templates/${o.key}`} className="group flex items-center gap-3">
                    <span className="block h-16 w-24 shrink-0 overflow-hidden rounded-input border border-line">
                      <Shot theme={o.key} alt="" />
                    </span>
                    <span className="text-sm text-ink group-hover:text-primary">{o.name[lang]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
