import { Link } from '@/src/i18n/navigation';
import { agency } from '@/agency.config';
import type { SiteContent } from '@/src/lib/content';
import { Placeholder } from '@/src/components/site/Placeholder';
import { copy, type Lang } from './home-copy';
import { TemplateGallery } from './TemplateGallery';
import { MarketingSection } from './MarketingSection';
import { Devices, Icon, Ornaments, Shot } from './visuals';

/**
 * Agency home page. Section order and layout follow webdesigntheme.com
 * (hero → 3 steps → plan banner → action → why us → dark design band →
 * template gallery → two cards → advantages → work → CTA), in navy.
 */
function Title({ first, second, center = true, onDark = false }: { first: string; second: string; center?: boolean; onDark?: boolean }) {
  return (
    <h2 className={`section-title ${center ? 'text-center' : ''} ${onDark ? 'on-dark !text-on-primary' : ''}`}>
      {first}
      <br />
      <span className="hl">{second}</span>
    </h2>
  );
}

export function AgencyHome({ lang, cases }: { lang: Lang; cases: SiteContent['cases'] }) {
  const gallery = agency.themes.map((t) => ({ key: t.key, name: t.name[lang], fit: t.fit[lang], category: t.category }));
  const categories = agency.categories.map((c) => ({ key: c.key, name: c.name[lang] }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-alt">
        <Ornaments />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-20">
          <span className="inline-block rounded-button bg-accent/15 px-5 py-2 text-sm text-primary">{copy.hero.badge[lang]}</span>
          <h1 className="mt-6 text-balance text-[1.8rem] font-medium leading-[1.2] text-ink sm:text-6xl sm:leading-[1.15]">
            {copy.hero.line1[0][lang]}
            <span className="hl">{copy.hero.line1[1][lang]}</span>
            {copy.hero.line1[2][lang]}
            <br />
            {copy.hero.line2[0][lang]}
            <span className="hl">{copy.hero.line2[1][lang]}</span>
            {copy.hero.line2[2][lang]}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl">{copy.hero.sub1[lang]}</p>
          <p className="mx-auto mt-2 max-w-2xl text-lg text-muted sm:text-xl">{copy.hero.sub2[lang]}</p>
          <Link href="/order" className="btn-primary btn-offset mt-9 !px-9 !py-3.5 !text-base uppercase tracking-wide">
            {copy.hero.cta[lang]}
          </Link>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <Devices alt={copy.hero.badge[lang]} />
        </div>
      </section>

      {/* 3 steps */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[5fr_7fr]">
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -left-4 -top-4 h-full w-full rounded-card bg-accent/15" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <div className="flex gap-1.5 border-b border-line px-4 py-3" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
            </div>
            <div className="aspect-[4/3]">
              <Shot theme="warm" alt="" />
            </div>
          </div>
        </div>
        <div>
          <Title first={copy.steps.title1[lang]} second={copy.steps.title2[lang]} center={false} />
          <ol className="mt-10 grid gap-5 sm:grid-cols-3">
            {copy.steps.items.map((step, i) => (
              <li key={step.title.en} className="rounded-card bg-primary p-6 text-on-primary">
                <span className="heading block text-5xl font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-xl">{step.title[lang]}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-80">{step.body[lang]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Plan banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-card bg-primary px-8 py-10 text-on-primary md:grid-cols-[1fr_auto] md:px-14">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30" />
          <div className="relative">
            <p className="text-sm uppercase tracking-widest text-accent">{copy.plans.label[lang]}</p>
            <h3 className="mt-3 text-xl opacity-90">{copy.plans.title[lang]}</h3>
            <p className="heading mt-1 text-5xl font-bold sm:text-6xl">{copy.plans.price}</p>
            <p className="mt-4 max-w-xl opacity-80">{copy.plans.body[lang]}</p>
          </div>
          <Link href="/pricing" className="relative inline-flex items-center gap-2 justify-self-start rounded-button bg-surface px-8 py-3.5 font-medium text-primary hover:bg-surface-alt md:justify-self-end">
            {copy.plans.cta[lang]} <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Action now */}
      <section className="mt-20 bg-surface-alt">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm uppercase tracking-widest text-accent">{copy.action.eyebrow[lang]}</p>
          <h2 className="section-title mt-3">{copy.action.title[lang]}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{copy.action.body[lang]}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/book" className="btn-ghost !border-primary !px-8 !py-3.5 !text-base !text-primary">
              {copy.action.book[lang]}
            </Link>
            <Link href="/order" className="btn-primary btn-offset !px-8 !py-3.5 !text-base">
              {copy.action.order[lang]}
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="why" className="mx-auto grid max-w-6xl scroll-mt-32 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <Title first={copy.why.title1[lang]} second={copy.why.title2[lang]} center={false} />
          <p className="mt-6 text-lg leading-relaxed text-muted">{copy.why.body[lang]}</p>
          <Link href="/templates" className="btn-primary btn-offset mt-8 !px-8 !py-3.5">
            {copy.design.cta[lang]}
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {copy.why.stats.map((s) => (
            <li key={s.label.en} className="rounded-card border border-line bg-surface p-5 text-center transition-shadow hover:shadow-card">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-primary">
                <Icon name={s.icon} />
              </span>
              <p className="heading mt-3 text-xl font-medium text-primary">{s.value[lang]}</p>
              <p className="mt-1 text-sm text-muted">{s.label[lang]}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Dark design band */}
      <section className="bg-primary text-on-primary">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <Title first={copy.design.title1[lang]} second={copy.design.title2[lang]} center={false} onDark />
            <p className="mt-6 leading-relaxed opacity-80">{copy.design.body[lang]}</p>
            <Link href="/templates" className="mt-8 inline-flex items-center gap-2 rounded-button bg-accent px-8 py-3.5 font-medium text-on-primary hover:opacity-90">
              {copy.design.cta[lang]} <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative mx-auto h-72 w-full max-w-lg sm:h-80" aria-hidden="true">
            {gallery.slice(0, 4).map((g, i) => (
              <div
                key={g.key}
                className="absolute w-[58%] overflow-hidden rounded-[12px] border-4 border-on-primary/10 shadow-card"
                style={{ left: `${i * 14}%`, top: `${(i % 2) * 18 + i * 6}%`, zIndex: i }}
              >
                <div className="aspect-[16/10]">
                  <Shot theme={g.key} alt="" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template gallery */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Title first={copy.gallery.title1[lang]} second={copy.gallery.title2[lang]} />
        <p className="mx-auto mt-4 max-w-xl text-center text-muted">{copy.gallery.body[lang]}</p>
        <TemplateGallery
          items={gallery}
          categories={categories}
          limit={8}
          labels={{ all: copy.gallery.all[lang], preview: copy.gallery.preview[lang], choose: copy.gallery.choose[lang] }}
        />
        <div className="mt-12 text-center">
          <Link href="/templates" className="btn-primary btn-offset !px-8 !py-3.5">
            {copy.gallery.more[lang]}
          </Link>
        </div>
      </section>

      {/* Two cards */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 md:grid-cols-2">
        {copy.cards.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group relative overflow-hidden rounded-card p-10 transition-shadow hover:shadow-card ${i === 0 ? 'bg-surface-alt text-ink' : 'bg-primary text-on-primary'}`}
          >
            <div aria-hidden="true" className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-accent/20" />
            <h3 className="relative text-2xl sm:text-3xl">{card.title[lang]}</h3>
            <p className="relative mt-3 opacity-80">{card.body[lang]}</p>
            <span className="relative mt-8 inline-flex items-center gap-2 font-medium text-accent">
              {card.cta[lang]} <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <MarketingSection lang={lang} />

      {/* Advantages */}
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Title first={copy.advantages.title1[lang]} second={copy.advantages.title2[lang]} />
          <p className="mx-auto mt-4 max-w-xl text-center text-muted">{copy.advantages.body[lang]}</p>
          <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {copy.advantages.items.map((item) => (
              <li key={item.title.en} className="flex gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                  <Icon name={item.icon} />
                </span>
                <div>
                  <h3 className="text-lg text-ink">{item.title[lang]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body[lang]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Work */}
      <section id="cases" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-20 sm:px-6">
        <Title first={copy.cases.title1[lang]} second={copy.cases.title2[lang]} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cases.items.map((item, i) => (
            <article key={item.title} className="card overflow-hidden">
              <div className="aspect-[16/10]">
                <Placeholder src={item.image} alt={item.title} seed={i + 2} />
              </div>
              <div className="p-6">
                <h3 className="text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="relative mt-16 overflow-hidden rounded-card bg-primary px-8 py-12 text-center text-on-primary">
          <div aria-hidden="true" className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-accent/30" />
          <h2 className="relative text-2xl sm:text-3xl">{copy.finalCta.title[lang]}</h2>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/order" className="rounded-button bg-accent px-8 py-3.5 font-medium text-on-primary hover:opacity-90">
              {copy.finalCta.order[lang]}
            </Link>
            <Link href="/#contact" className="rounded-button border border-on-primary/40 px-8 py-3.5 font-medium hover:bg-on-primary/10">
              {copy.finalCta.contact[lang]}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
