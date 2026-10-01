import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { agency, ADD_ON_GROUPS, type AddOn } from '@/agency.config';
import { copy, langOf } from '@/src/components/agency/home-copy';
import { Icon } from '@/src/components/agency/visuals';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: copy.nav.services[langOf(locale)] };
}

/**
 * Every service we sell beyond the website build, grouped like the pricing
 * page, plus the KPIs we report on and the monthly working rhythm.
 * Prices come from agency.config.ts.
 */
export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agency');
  const lang = langOf(locale);
  const s = copy.services;
  const money = new Intl.NumberFormat(locale === 'en' ? 'en-HK' : 'zh-HK', { style: 'currency', currency: agency.currency, maximumFractionDigits: 0 });
  const addOns = agency.addOns as AddOn[];

  return (
    <>
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h1 className="section-title max-w-3xl">{s.title[lang]}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{s.sub[lang]}</p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label={copy.nav.services[lang]}>
            {ADD_ON_GROUPS.map((g) => (
              <a key={g} href={`#${g}`} className="rounded-button bg-surface px-4 py-2 text-sm text-ink hover:bg-line">
                {t(`groups.${g}`)}
              </a>
            ))}
            <a href="#kpi" className="rounded-button bg-primary px-4 py-2 text-sm text-on-primary">{s.kpiTitle2[lang]}</a>
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-16 sm:px-6">
        {ADD_ON_GROUPS.map((g) => {
          const items = addOns.filter((a) => a.group === g);
          if (items.length === 0) return null;
          return (
            <section key={g} id={g} className="scroll-mt-32">
              <h2 className="text-2xl text-ink sm:text-3xl">{t(`groups.${g}`)}</h2>
              <p className="mt-2 text-muted">{s.groupIntro[g][lang]}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((a) => (
                  <article key={a.key} className="card flex flex-col p-5">
                    <h3 className="text-lg text-ink">{a.name[lang]}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{a.description[lang]}</p>
                    <p className="mt-4 text-sm text-ink">
                      {a.oneOff > 0 && <span className="font-semibold">{money.format(a.oneOff)}{a.perUnit ? ` ${a.perUnit[lang]}` : ''}</span>}
                      {a.oneOff > 0 && a.monthly > 0 && ' + '}
                      {a.monthly > 0 && <span className={a.oneOff > 0 ? 'text-muted' : 'font-semibold'}>{money.format(a.monthly)} {t('perMonth')}</span>}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section id="kpi" className="on-dark scroll-mt-32 bg-primary text-on-primary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="section-title !text-on-primary">
            {s.kpiTitle1[lang]} <span className="hl">{s.kpiTitle2[lang]}</span>
          </h2>
          <p className="mt-3 max-w-2xl opacity-80">{s.kpiBody[lang]}</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {s.kpis.map((k) => (
              <li key={k.name.en} className="rounded-card border border-on-primary/15 bg-on-primary/5 p-5">
                <Icon name="chart" className="text-accent-soft h-5 w-5" />
                <h3 className="mt-3 text-base">{k.name[lang]}</h3>
                <p className="mt-1 text-sm opacity-75">{k.body[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="section-title">{s.stepsTitle[lang]}</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {s.steps.map((step, i) => (
            <li key={step.title.en} className="card p-6">
              <span className="heading text-4xl font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-lg text-ink">{step.title[lang]}</h3>
              <p className="mt-1 text-sm text-muted">{step.body[lang]}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 rounded-card bg-surface-alt px-8 py-10 text-center">
          <h2 className="text-2xl text-ink sm:text-3xl">{s.ctaTitle[lang]}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{s.ctaBody[lang]}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/#contact" className="btn-primary btn-offset !px-7">{s.ctaContact[lang]}</Link>
            <Link href="/pricing" className="btn-ghost !px-7">{s.ctaOrder[lang]}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
