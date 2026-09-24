import type { ReactNode } from 'react';
import { requireAdminPage } from '@/src/lib/admin-session';
import { getAdminLang, getAdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { Sidebar, NavItem } from '@/src/components/admin/Sidebar';

/**
 * Every admin page except /admin/login sits under this layout, which checks
 * the session cookie on the server. The sidebar only lists enabled modules.
 */
export default async function AdminAppLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();
  const cfg = getConfig();
  const t = await getAdminT();
  const lang = await getAdminLang();
  const owner = session.role === 'owner';

  const items: NavItem[] = [
    { href: '/admin', label: t('dashboard') },
    { href: '/admin/contacts', label: t('contacts') },
    { href: '/admin/inbox', label: t('inbox') },
    ...(cfg.modules.booking ? [{ href: '/admin/bookings', label: t('bookings') }, { href: '/admin/bookings/setup', label: t('bookingSetup') }] : []),
    ...(cfg.modules.payments && owner ? [{ href: '/admin/payments', label: t('payments') }] : []),
    ...(cfg.modules.catalog ? [{ href: '/admin/products', label: t('products') }] : []),
    ...(owner ? [{ href: '/admin/import', label: t('import') }, { href: '/admin/team', label: t('team') }] : []),
  ];

  return (
    <div className="min-h-screen bg-bg md:flex">
      <Sidebar
        items={items}
        business={pickLocalized(cfg.business.name, cfg.locales[0])}
        user={`${session.name} · ${owner ? t('owner') : t('staffRole')}`}
        lang={lang}
        labels={{ logout: t('logout'), viewSite: t('viewSite') }}
        siteHref={`/${cfg.locales[0]}`}
      />
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
