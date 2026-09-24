'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
  business: string;
  user: string;
  lang: 'zh-Hant' | 'en';
  labels: { logout: string; viewSite: string };
  siteHref: string;
};

/** Admin navigation. Collapses to a top bar with a <details> menu on phones. */
export function Sidebar({ items, business, user, lang, labels, siteHref }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || (pathname.startsWith(`${href}/`) && !items.some((i) => i.href !== href && pathname.startsWith(i.href) && i.href.length > href.length));

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  function toggleLang() {
    document.cookie = `admin_lang=${lang === 'en' ? 'zh-Hant' : 'en'}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  const links = items.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? 'page' : undefined}
      className={`block rounded-input px-3 py-2 text-sm ${isActive(item.href) ? 'bg-surface-alt font-semibold text-primary' : 'text-ink hover:bg-surface-alt'}`}
    >
      {item.label}
    </Link>
  ));

  const footer = (
    <div className="space-y-2 border-t border-line p-3 text-xs text-muted">
      <p className="truncate">{user}</p>
      <div className="flex flex-wrap gap-3">
        <a href={siteHref} target="_blank" rel="noreferrer" className="hover:text-ink">{labels.viewSite} ↗</a>
        <button type="button" onClick={toggleLang} className="hover:text-ink">{lang === 'en' ? '中文' : 'English'}</button>
        <button type="button" onClick={logout} className="hover:text-ink">{labels.logout}</button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <p className="heading truncate px-5 py-5 text-base text-ink">{business}</p>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">{links}</nav>
        {footer}
      </aside>
      <details className="border-b border-line bg-surface md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <span className="heading truncate text-ink">{business}</span>
          <span className="text-sm text-muted">☰</span>
        </summary>
        <nav className="space-y-0.5 px-3 pb-3">{links}</nav>
        {footer}
      </details>
    </>
  );
}
