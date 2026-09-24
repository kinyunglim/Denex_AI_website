import { getTranslations } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { Locale, pickLocalized } from '@/src/lib/config';
import { getConfig } from '@/src/lib/site';
import { getBusiness } from '@/src/lib/site-context';
import { routing } from '@/src/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * Top navigation: anchors to home sections plus links for enabled modules.
 * The mobile menu uses <details> so it works without JavaScript.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  const cfg = getConfig();
  const business = await getBusiness();
  const name = pickLocalized(business.name, locale);

  const anchors = cfg.sections
    .filter((s) => s !== 'hero')
    .map((s) => ({ href: `/#${s}`, label: t(s) }));
  const links = [
    ...(cfg.modules.catalog ? [{ href: '/products', label: t('products') }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="heading truncate text-lg text-ink">
          {name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {[...anchors, ...links].map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locales={routing.locales} />
          {cfg.modules.booking && (
            <Link href="/book" className="btn-primary hidden !py-2 sm:inline-flex">
              {t('book')}
            </Link>
          )}
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-button border border-line px-3 py-2 text-sm text-ink">{t('menu')}</summary>
            <div className="card absolute right-0 mt-2 flex w-48 flex-col p-2 text-sm">
              {[...anchors, ...links].map((l) => (
                <Link key={l.href} href={l.href} className="rounded-input px-3 py-2 text-ink hover:bg-surface-alt">
                  {l.label}
                </Link>
              ))}
              {cfg.modules.booking && (
                <Link href="/book" className="rounded-input px-3 py-2 font-semibold text-primary hover:bg-surface-alt">
                  {t('book')}
                </Link>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
