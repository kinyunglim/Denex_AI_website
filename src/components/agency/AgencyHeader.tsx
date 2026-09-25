import { Link } from '@/src/i18n/navigation';
import { Locale, pickLocalized } from '@/src/lib/config';
import { getBusiness } from '@/src/lib/site-context';
import { routing } from '@/src/i18n/routing';
import { LanguageSwitcher } from '@/src/components/site/LanguageSwitcher';
import { AgencyNav } from './AgencyNav';
import { copy, langOf } from './home-copy';
import { Icon, LogoMark } from './visuals';

/**
 * Storefront header: navy promo bar, then centered logo with the order pill
 * on the right and the nav underneath (webdesigntheme.com layout).
 */
export async function AgencyHeader({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const business = await getBusiness();
  const name = pickLocalized(business.name, locale);
  const items = [
    { href: '/', label: copy.nav.home[lang] },
    { href: '/templates', label: copy.nav.templates[lang] },
    { href: '/pricing', label: copy.nav.pricing[lang] },
    { href: '/#cases', label: copy.nav.cases[lang] },
    { href: '/#why', label: copy.nav.about[lang] },
    { href: '/#contact', label: copy.nav.contact[lang] },
  ];

  return (
    <>
      <div id="top" className="bg-primary text-on-primary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-2 text-center text-xs sm:flex-row sm:gap-6 sm:text-sm">
          <p>{copy.topBar.promo[lang]}</p>
          <div className="flex items-center gap-4 opacity-90">
            {business.phone && (
              <a href={`tel:${business.phone.replace(/\s/g, '')}`} className="hover:opacity-100">
                {business.phone}
              </a>
            )}
            {business.whatsapp && (
              <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                WhatsApp {business.whatsapp}
              </a>
            )}
            <Link href="/order" className="font-medium underline-offset-4 hover:underline">
              {copy.topBar.quote[lang]} →
            </Link>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-surface-alt/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 lg:py-4">
          <div className="hidden lg:block">
            <LanguageSwitcher locales={routing.locales} />
          </div>
          <Link href="/" className="col-start-1 flex items-center gap-2.5 justify-self-start lg:col-start-2 lg:justify-self-center">
            <LogoMark className="h-10 w-10 lg:h-12 lg:w-12" />
            <span className="heading whitespace-nowrap text-base font-medium leading-tight text-ink lg:text-lg">{name}</span>
          </Link>
          <div className="col-start-3 flex items-center justify-end gap-2">
            <Link href="/order" className="btn-primary !hidden !px-7 !py-3 sm:!inline-flex">
              {copy.nav.order[lang]}
            </Link>
            <details className="relative lg:hidden">
              <summary aria-label={copy.nav.menu[lang]} className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full text-ink hover:bg-surface">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </summary>
              <div className="card absolute right-0 mt-2 flex w-56 flex-col p-2 text-sm">
                {items.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-input px-3 py-2.5 text-ink hover:bg-surface-alt">
                    {l.label}
                  </Link>
                ))}
                <Link href="/order" className="btn-primary mt-2">
                  {copy.nav.order[lang]} <Icon name="arrow" className="h-4 w-4" />
                </Link>
                <div className="mt-3 flex justify-center">
                  <LanguageSwitcher locales={routing.locales} />
                </div>
              </div>
            </details>
          </div>
        </div>
        <div className="hidden border-t border-line/70 lg:block">
          <AgencyNav items={items} />
        </div>
      </header>
    </>
  );
}
