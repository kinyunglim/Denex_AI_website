import { getTranslations } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { SiteContent } from '@/src/lib/content';
import { Theme } from '@/themes';
import { Placeholder } from './Placeholder';
import { ContactForm } from './ContactForm';

/**
 * Home page sections. Structure is shared by every theme; the theme only
 * changes tokens (colour, type, radius) and the hero emphasis (split/center).
 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl text-ink sm:text-4xl">{children}</h2>;
}

export function Hero({ content, theme, ctaHref }: { content: SiteContent['hero']; theme: Theme; ctaHref: string }) {
  if (theme.hero === 'center') {
    return (
      <section id="hero" className="relative isolate overflow-hidden bg-hero text-on-hero">
        {content.image && (
          <>
            {/* Photo behind a veil in the hero colour, so text keeps the theme's contrast. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.image} alt="" className="themed-img absolute inset-0 -z-20 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-hero/80" />
          </>
        )}
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
          {content.eyebrow && <p className="text-sm font-semibold uppercase tracking-widest opacity-80">{content.eyebrow}</p>}
          <h1 className="mt-4 text-4xl sm:text-6xl">{content.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg opacity-85">{content.subtitle}</p>
          <div className="mt-10 flex justify-center">
            <Link href={ctaHref} className="btn-primary">
              {content.cta}
            </Link>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="hero" className="bg-hero text-on-hero">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          {content.eyebrow && <p className="text-sm font-semibold tracking-wide text-accent">{content.eyebrow}</p>}
          <h1 className="mt-3 text-4xl sm:text-5xl">{content.title}</h1>
          <p className="mt-5 max-w-xl text-lg opacity-85">{content.subtitle}</p>
          <Link href={ctaHref} className="btn-primary mt-8">
            {content.cta}
          </Link>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-card shadow-card">
          <Placeholder src={content.image} alt={content.title} seed={1} />
        </div>
      </div>
    </section>
  );
}

export function Services({ content }: { content: SiteContent['services'] }) {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionTitle>{content.title}</SectionTitle>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {content.items.map((item) => (
          <article key={item.title} className="card flex flex-col p-6">
            <h3 className="text-xl text-ink">{item.title}</h3>
            <p className="mt-3 flex-1 text-muted">{item.description}</p>
            {item.price && <p className="mt-5 font-semibold text-primary">{item.price}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

export function Cases({ content }: { content: SiteContent['cases'] }) {
  return (
    <section id="cases" className="bg-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionTitle>{content.title}</SectionTitle>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.items.map((item, i) => (
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
      </div>
    </section>
  );
}

export function About({ content }: { content: SiteContent['about'] }) {
  return (
    <section id="about" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-card md:order-2">
        <Placeholder src={content.image} alt={content.title} seed={5} />
      </div>
      <div>
        <SectionTitle>{content.title}</SectionTitle>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted">{content.body}</p>
      </div>
    </section>
  );
}

export async function Contact({ content, whatsapp }: { content: SiteContent['contact']; whatsapp: string }) {
  const t = await getTranslations('contact');
  return (
    <section id="contact" className="bg-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
        <div>
          <SectionTitle>{content.title}</SectionTitle>
          <p className="mt-4 text-lg text-muted">{content.body}</p>
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-8">
              {t('whatsapp')} · {whatsapp}
            </a>
          )}
        </div>
        <div className="card p-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
