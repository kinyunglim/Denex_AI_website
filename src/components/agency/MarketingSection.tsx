import { Link } from '@/src/i18n/navigation';
import { agency, type AddOn } from '@/agency.config';
import { copy, type Lang } from './home-copy';
import { Icon } from './visuals';

const hkd = (n: number) => `HK$${n.toLocaleString('en-US')}`;

/**
 * Cheapest entry price among some add-ons, as "HK$2,500 起" or "HK$800／月起".
 * One-off prices win over monthly ones when both exist, since they are the
 * easier first step for a customer.
 */
export function fromPrice(keys: string[], lang: Lang): string {
  const items = (agency.addOns as AddOn[]).filter((a) => keys.includes(a.key));
  const m = copy.marketing;
  const oneOffs = items.filter((a) => a.oneOff > 0).map((a) => a.oneOff);
  const monthlies = items.filter((a) => a.oneOff === 0 && a.monthly > 0).map((a) => a.monthly);
  if (oneOffs.length) {
    const v = hkd(Math.min(...oneOffs));
    return lang === 'en' ? `${m.from.en} ${v}` : `${v} ${m.from['zh-Hant']}`;
  }
  if (monthlies.length) {
    const v = `${hkd(Math.min(...monthlies))}${m.perMonth[lang]}`;
    return lang === 'en' ? `${m.from.en} ${v}` : `${v}${m.from['zh-Hant']}`;
  }
  return '';
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
