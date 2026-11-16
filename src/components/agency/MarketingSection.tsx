import { Link } from '@/src/i18n/navigation';
import { copy, type Lang } from './home-copy';
import { Icon } from './visuals';


/** Services outside a package are scoped before any charge. */
export function fromPrice(_keys: string[], lang: Lang): string {
  return lang === 'en' ? 'See package inclusions or request a quote' : '按方案包含範圍提供，額外需要另行報價';
}

/** Home page band: the marketing services beyond website + CRM. */
export function MarketingSection({ lang }: { lang: Lang }) {
  const m = copy.marketing;
  return (
    <section id="marketing" className="on-dark scroll-mt-32 bg-primary text-on-primary">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="section-title text-center !text-on-primary">
          {m.title1[lang]}
          <br />
          <span className="hl">{m.title2[lang]}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center opacity-80">{m.body[lang]}</p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {m.pillars.map((p) => (
            <li key={p.title.en} className="rounded-card border border-on-primary/15 bg-on-primary/5 p-6 transition-colors hover:bg-on-primary/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-primary">
                <Icon name={p.icon} />
              </span>
              <h3 className="mt-4 text-lg">{p.title[lang]}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{p.body[lang]}</p>
              <p className="text-accent-soft mt-4 text-sm font-medium">{fromPrice(p.keys, lang)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <Link href="/services" className="inline-flex items-center gap-2 rounded-button bg-surface px-8 py-3.5 font-medium text-primary hover:bg-surface-alt">
            {m.cta[lang]} <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
