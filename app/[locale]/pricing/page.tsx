import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { agency, AddOn } from '@/agency.config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agency');
  return { title: t('pricingTitle') };
}

const GROUPS: AddOn['group'][] = ['feature', 'content', 'brand', 'growth', 'care'];

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agency');
  const lang = locale === 'en' ? 'en' : 'zh-Hant';
  const money = new Intl.NumberFormat(locale === 'en' ? 'en-HK' : 'zh-HK', { style: 'currency', currency: agency.currency, maximumFractionDigits: 0 });

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl text-ink">{t('pricingTitle')}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t('pricingSub')}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {agency.packages.map((p) => (
          <article key={p.key} className={`card relative flex flex-col p-6 ${p.highlight ? 'ring-2 ring-primary' : ''}`}>
            {p.highlight && <span className="absolute -top-3 left-6 rounded-button bg-primary px-3 py-1 text-xs font-semibold text-on-primary">{t('popular')}</span>}
            <h2 className="text-2xl text-ink">{p.name[lang]}</h2>
            <p className="mt-1 text-sm text-muted">{p.tagline[lang]}</p>
            <p className="mt-6 text-3xl font-semibold text-ink">{money.format(p.oneOff)}</p>
            <p className="text-sm text-muted">{t('oneOff')} · + {money.format(p.monthly)} {t('perMonth')}</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-ink">
              {p.includes.map((i) => (
                <li key={i.en} className="flex gap-2"><span className="text-primary">✓</span>{i[lang]}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted">{t('delivery', { n: p.deliveryDays })}</p>
            <Link href={`/order?package=${p.key}`} className={`mt-4 ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}>{t('choose')}</Link>
          </article>
        ))}
      </div>

      <h2 className="mt-16 text-3xl text-ink">{t('addOnsTitle')}</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g} className="card p-5">
            <h3 className="mb-3 text-lg text-ink">{t(`groups.${g}`)}</h3>
            <ul className="divide-y divide-line">
              {agency.addOns.filter((a) => a.group === g).map((a) => (
                <li key={a.key} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink">{a.name[lang]}</p>
                    <p className="text-muted">{a.description[lang]}</p>
                  </div>
                  <p className="shrink-0 text-right text-ink">
                    {a.oneOff > 0 && <span className="block">{money.format(a.oneOff)}{'perUnit' in a && a.perUnit ? ` ${a.perUnit[lang]}` : ''}</span>}
                    {a.monthly > 0 && <span className="block text-muted">+ {money.format(a.monthly)} {t('perMonth')}</span>}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
