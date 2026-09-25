'use client';

import { Link, usePathname } from '@/src/i18n/navigation';

export type NavItem = { href: string; label: string };

/** Centered desktop nav; the current page is shown in the accent colour. */
export function AgencyNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center justify-center gap-1 text-[17px] lg:flex">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : !item.href.includes('#') && pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`px-4 py-3 transition-colors hover:text-accent ${active ? 'text-accent' : 'text-ink'}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Floating "back to top" button (appears after scrolling). */
export function BackToTop({ label }: { label: string }) {
  return (
    <a
      href="#top"
      aria-label={label}
      className="no-print fixed bottom-24 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-primary shadow-card transition-transform hover:-translate-y-0.5"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </a>
  );
}
