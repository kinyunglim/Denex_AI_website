import Link from 'next/link';
import { getAdminSession } from '@/src/lib/admin-session';
import { getAdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { fmtDateTime, fmtMoney } from '@/src/lib/admin-format';
import { toZonedDateStr, zonedDateAtMinutes } from '@/src/lib/time';
import { CrmService } from '@/src/modules/crm/crm.service';
import { ContactFormService } from '@/src/modules/contact-form/contact-form.service';
import { BookingService } from '@/src/modules/booking/booking.service';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { Empty, PageHeader, Panel, Stat } from '@/src/components/admin/ui';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ forbidden?: string }> }) {
  const { forbidden } = await searchParams;
  const t = await getAdminT();
  const session = await getAdminSession();
  const cfg = getConfig();
  const owner = session?.role === 'owner';

  const today = toZonedDateStr(new Date(), cfg.timezone);
  const monthStart = zonedDateAtMinutes(`${today.slice(0, 8)}01`, 0, cfg.timezone);

  const [contacts, unhandled, upcoming, revenue, recent] = await Promise.all([
    CrmService.countContacts(),
    ContactFormService.countUnhandled(),
    cfg.modules.booking ? BookingService.countUpcoming() : Promise.resolve(null),
    cfg.modules.payments && owner ? PaymentsService.total(monthStart, new Date()) : Promise.resolve(null),
    ContactFormService.listRecent(8, true),
  ]);

  return (
    <div>
      <PageHeader title={t('dashboard')} />
      {forbidden && <p className="card mb-6 p-4 text-sm text-primary">{t('forbidden')}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('contactsTotal')} value={contacts} />
        <Stat label={t('unhandled')} value={unhandled} />
        {upcoming !== null && <Stat label={t('upcoming')} value={upcoming} />}
        {revenue !== null && <Stat label={t('revenueMonth')} value={fmtMoney(revenue)} />}
      </div>
      <Panel title={t('recentEnquiries')} className="mt-6">
        {recent.length === 0 ? (
          <Empty>{t('none')}</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((s) => (
              <li key={s.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/contacts/${s.contactId}`} className="font-semibold text-ink hover:text-primary">{s.name}</Link>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">{s.message}</p>
                </div>
                <span className="text-xs text-muted">{fmtDateTime(s.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/inbox" className="mt-3 inline-block text-sm text-primary">{t('inbox')} →</Link>
      </Panel>
    </div>
  );
}
