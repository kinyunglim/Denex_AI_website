import { Link } from '@/src/i18n/navigation';
import { agency } from '@/agency.config';
import { Locale, pickLocalized } from '@/src/lib/config';
import { getBusiness } from '@/src/lib/site-context';
import { copy, langOf } from './home-copy';
import { LogoMark } from './visuals';

/** Dark navy footer: brand + tagline, site links, plans, contact. */
export async function AgencyFooter({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const business = await getBusiness();
  const name = pickLocalized(business.name, locale);
  const address = pickLocalized(business.address, locale);
  const links = [
    { href: '/', label: copy.nav.home[lang] },
    { href: '/templates', label: copy.nav.templates[lang] },
    { href: '/pricing', label: copy.nav.pricing[lang] },
    { href: '/order', label: copy.nav.order[lang] },
    { href: '/#contact', label: copy.nav.contact[lang] },
  ];

  return (
    <footer className="bg-primary text-on-primary">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-[2fr_1fr_1fr_1.3fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark src={business.logo} className="h-11 w-11" />
            <span className="heading text-lg">{name}</span>
          </div>
          <p className="mt-4 max-w-sm leading-relaxed opacity-75">{copy.footer.tagline[lang]}</p>
          <a href="https://denexconsulting.com" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-accent hover:underline">
            {copy.footer.parent[lang]} ↗
          </a>
        </div>
        <nav>
          <p className="heading text-base text-accent">{copy.footer.site[lang]}</p>
          <ul className="mt-4 space-y-2.5 opacity-80">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:opacity-100 hover:underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="heading text-base text-accent">{copy.footer.plans[lang]}</p>
          <ul className="mt-4 space-y-2.5 opacity-80">
            {agency.packages.map((p) => (
              <li key={p.key}>
                <Link href={`/order?package=${p.key}`} className="hover:underline">{p.name[lang]}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="heading text-base text-accent">{copy.footer.contact[lang]}</p>
          <ul className="mt-4 space-y-2.5 opacity-80">
            {address && <li>{address}</li>}
            {business.phone && <li><a href={`tel:${business.phone.replace(/\s/g, '')}`} className="hover:underline">{business.phone}</a></li>}
            {business.email && <li><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></li>}
            <li>
              <Link href="/book" className="hover:underline">{copy.action.book[lang]}</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-on-primary/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs opacity-60 sm:px-6">
          © {new Date().getFullYear()} {name}. {copy.footer.rights[lang]}
        </p>
      </div>
    </footer>
  );
}
