import Link from 'next/link';
import { requireModulePage } from '@/src/lib/modules';
import { getAdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { fmtTime } from '@/src/lib/admin-format';
import { addDays, isDateStr, toZonedDateStr, weekdayOf, zonedDateAtMinutes } from '@/src/lib/time';
import { BookingService } from '@/src/modules/booking/booking.service';
import { AppointmentStatus } from '@/src/modules/booking/booking.model';
import { CrmService } from '@/src/modules/crm/crm.service';
import { ActionForm } from '@/src/components/admin/ActionForm';
import { ActionButton } from '@/src/components/admin/ActionButton';
import { Badge, Empty, Field, PageHeader, Panel } from '@/src/components/admin/ui';
import { createBookingAction, setAppointmentStatusAction } from '../actions';

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  requireModulePage('booking');
  const { week } = await searchParams;
  const t = await getAdminT();
  const cfg = getConfig();
  const lang = cfg.locales[0];
  const today = toZonedDateStr(new Date(), cfg.timezone);
  const anchor = week && isDateStr(week) ? week : today;
  const monday = addDays(anchor, -((weekdayOf(anchor) + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const [appts, services, staff, contacts] = await Promise.all([
    BookingService.listRange(zonedDateAtMinutes(monday, 0, cfg.timezone), zonedDateAtMinutes(addDays(monday, 7), 0, cfg.timezone)),
    BookingService.listServices(false),
    BookingService.listStaff(false),
    CrmService.listContacts({ limit: 100 }),
  ]);
  const contactNames = new Map((await Promise.all([...new Set(appts.map((a) => a.contactId))].map((id) => CrmService.getContact(id).catch(() => null)))).filter((c) => c !== null).map((c) => [c.id, c.name]));
  const statusLabel: Record<AppointmentStatus, string> = { booked: t('booked'), done: t('done'), cancelled: t('cancelled'), 'no-show': t('noShow') };
  const dayFmt = new Intl.DateTimeFormat('zh-HK', { timeZone: 'UTC', weekday: 'short', month: 'numeric', day: 'numeric' });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('bookings')}
        actions={
          <>
            <Link href={`?week=${addDays(monday, -7)}`} className="btn-ghost !py-2">← {t('prevWeek')}</Link>
            <Link href="?" className="btn-ghost !py-2">•</Link>
            <Link href={`?week=${addDays(monday, 7)}`} className="btn-ghost !py-2">{t('nextWeek')} →</Link>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-7">
        {days.map((d) => {
          const list = appts.filter((a) => toZonedDateStr(new Date(a.start), cfg.timezone) === d);
          return (
            <div key={d} className={`card min-h-32 p-3 ${d === today ? 'ring-1 ring-primary' : ''}`}>
              <p className="mb-2 text-xs font-semibold text-muted">{dayFmt.format(new Date(`${d}T00:00:00Z`))}</p>
              {list.length === 0 ? (
                <p className="text-xs text-muted">—</p>
              ) : (
                <ul className="space-y-2">
                  {list.map((a) => (
                    <li key={a.id} className={`rounded-input border border-line p-2 text-xs ${a.status === 'cancelled' ? 'opacity-50' : ''}`}>
                      <p className="font-semibold text-ink">{fmtTime(a.start)}–{fmtTime(a.end)}</p>
                      <Link href={`/admin/contacts/${a.contactId}`} className="block truncate text-ink hover:text-primary">{contactNames.get(a.contactId) ?? '—'}</Link>
                      <p className="truncate text-muted">{pickLocalized(services.find((s) => s.id === a.serviceId)?.name, lang)} · {staff.find((s) => s.id === a.staffId)?.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <Badge tone={a.status === 'booked' ? 'primary' : 'muted'}>{statusLabel[a.status]}</Badge>
                        {a.status === 'booked' && (
                          <>
                            <ActionButton action={setAppointmentStatusAction.bind(null, a.id, 'done')} label="✓" className="text-xs text-primary" />
                            <ActionButton action={setAppointmentStatusAction.bind(null, a.id, 'no-show')} label={t('noShow')} className="text-xs text-muted" />
                            <ActionButton action={setAppointmentStatusAction.bind(null, a.id, 'cancelled')} label="✕" confirm={t('cancelled') + '?'} className="text-xs text-muted" />
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <Panel title={t('newBooking')}>
        {services.length === 0 || staff.length === 0 ? (
          <Empty><Link href="/admin/bookings/setup" className="text-primary">{t('bookingSetup')} →</Link></Empty>
        ) : (
          <ActionForm action={createBookingAction} submitLabel={t('add')} resetOnSuccess className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={t('contact')}>
              <select name="contactId" required className="field">
                {contacts.items.map((c) => <option key={c.id} value={c.id}>{c.name} {c.phone ?? c.email ?? ''}</option>)}
              </select>
            </Field>
            <Field label={t('service')}>
              <select name="serviceId" required className="field">
                {services.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{pickLocalized(s.name, lang)} ({s.durationMin}{t('minutes')})</option>)}
              </select>
            </Field>
            <Field label={t('staff')}>
              <select name="staffId" required className="field">
                {staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label={t('start')}><input name="start" type="datetime-local" step={300} required className="field" /></Field>
            <Field label={t('notes')}><input name="notes" className="field" /></Field>
          </ActionForm>
        )}
      </Panel>
    </div>
  );
}
