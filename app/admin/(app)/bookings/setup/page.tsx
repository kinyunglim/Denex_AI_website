import { requireModulePage } from '@/src/lib/modules';
import { getAdminSession } from '@/src/lib/admin-session';
import { getAdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { fmtDateTime } from '@/src/lib/admin-format';
import { minutesToHHMM } from '@/src/lib/time';
import { BookingService } from '@/src/modules/booking/booking.service';
import { ServiceSummary, StaffSummary } from '@/src/modules/booking/booking.model';
import { ActionForm } from '@/src/components/admin/ActionForm';
import { ActionButton } from '@/src/components/admin/ActionButton';
import { Empty, Field, PageHeader, Panel } from '@/src/components/admin/ui';
import type { AdminT } from '@/src/lib/admin-i18n';
import {
  addAwayAction,
  createServiceAction,
  createStaffAction,
  removeAwayAction,
  updateServiceAction,
  updateStaffAction,
} from '../../actions';

const hoursText = (s?: StaffSummary) => (s?.hours ?? []).map((h) => `${h.weekday} ${minutesToHHMM(h.startMin)}-${minutesToHHMM(h.endMin)}`).join('\n');

function ServiceFields({ t, s }: { t: AdminT; s?: ServiceSummary }) {
  return (
    <>
      <Field label={t('nameZhHant')}><input name="name_zhHant" defaultValue={s?.name['zh-Hant'] ?? ''} className="field" /></Field>
      <Field label={t('nameZhHans')}><input name="name_zhHans" defaultValue={s?.name['zh-Hans'] ?? ''} className="field" /></Field>
      <Field label={t('nameEn')}><input name="name_en" defaultValue={s?.name.en ?? ''} className="field" /></Field>
      <Field label={t('durationMin')}><input name="durationMin" type="number" min={5} step={5} defaultValue={s?.durationMin ?? 60} required className="field" /></Field>
      <Field label={t('price')}><input name="price" type="number" min={0} step="1" defaultValue={s?.price ?? 0} className="field" /></Field>
      <Field label={t('order')}><input name="order" type="number" defaultValue={s?.order ?? 0} className="field" /></Field>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="active" defaultChecked={s?.active ?? true} /> {t('active')}</label>
    </>
  );
}

function StaffFields({ t, s, services, lang }: { t: AdminT; s?: StaffSummary; services: ServiceSummary[]; lang: 'zh-Hant' | 'zh-Hans' | 'en' }) {
  return (
    <>
      <Field label={t('name')}><input name="name" defaultValue={s?.name ?? ''} required className="field" /></Field>
      <fieldset className="space-y-1">
        <legend className="mb-1 text-xs font-semibold text-muted">{t('services')}</legend>
        {services.map((sv) => (
          <label key={sv.id} className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="serviceIds" value={sv.id} defaultChecked={s?.serviceIds.includes(sv.id)} /> {pickLocalized(sv.name, lang)}
          </label>
        ))}
      </fieldset>
      <Field label={t('hours')} hint={t('hoursHint')}><textarea name="hours" rows={5} defaultValue={hoursText(s)} className="field font-mono text-xs" /></Field>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="active" defaultChecked={s?.active ?? true} /> {t('active')}</label>
    </>
  );
}

export default async function BookingSetupPage() {
  requireModulePage('booking');
  const t = await getAdminT();
  const session = await getAdminSession();
  const owner = session?.role === 'owner';
  const lang = getConfig().locales[0];
  const [services, staff, away] = await Promise.all([
    BookingService.listServices(false),
    BookingService.listStaff(false),
    BookingService.listUpcomingAway(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t('bookingSetup')} />
      {!owner && <p className="card p-4 text-sm text-muted">{t('forbidden')}</p>}

      {owner && (
        <Panel title={t('services')}>
          <div className="space-y-4">
            {services.map((s) => (
              <details key={s.id} className="rounded-input border border-line p-3">
                <summary className="cursor-pointer text-sm font-semibold text-ink">
                  {pickLocalized(s.name, lang)} · {s.durationMin}{t('minutes')} · {s.price} {s.active ? '' : `(${t('inactive')})`}
                </summary>
                <ActionForm action={updateServiceAction.bind(null, s.id)} submitLabel={t('save')} className="mt-3 grid gap-3 sm:grid-cols-3">
                  <ServiceFields t={t} s={s} />
                </ActionForm>
              </details>
            ))}
            <details className="rounded-input border border-dashed border-line p-3" open={services.length === 0}>
              <summary className="cursor-pointer text-sm font-semibold text-primary">+ {t('add')}</summary>
              <ActionForm action={createServiceAction} submitLabel={t('add')} resetOnSuccess className="mt-3 grid gap-3 sm:grid-cols-3">
                <ServiceFields t={t} />
              </ActionForm>
            </details>
          </div>
        </Panel>
      )}

      {owner && (
        <Panel title={t('staff')}>
          <div className="space-y-4">
            {staff.map((s) => (
              <details key={s.id} className="rounded-input border border-line p-3">
                <summary className="cursor-pointer text-sm font-semibold text-ink">{s.name} {s.active ? '' : `(${t('inactive')})`}</summary>
                <ActionForm action={updateStaffAction.bind(null, s.id)} submitLabel={t('save')} className="mt-3 space-y-3">
                  <StaffFields t={t} s={s} services={services} lang={lang} />
                </ActionForm>
              </details>
            ))}
            <details className="rounded-input border border-dashed border-line p-3" open={staff.length === 0}>
              <summary className="cursor-pointer text-sm font-semibold text-primary">+ {t('add')}</summary>
              <ActionForm action={createStaffAction} submitLabel={t('add')} resetOnSuccess className="mt-3 space-y-3">
                <StaffFields t={t} services={services} lang={lang} />
              </ActionForm>
            </details>
          </div>
        </Panel>
      )}

      <Panel title={t('timeOff')}>
        {away.length === 0 ? (
          <Empty>{t('none')}</Empty>
        ) : (
          <ul className="mb-4 divide-y divide-line">
            {away.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="text-ink">{staff.find((s) => s.id === a.staffId)?.name} · {fmtDateTime(a.start)} → {fmtDateTime(a.end)} {a.reason && `· ${a.reason}`}</span>
                <ActionButton action={removeAwayAction.bind(null, a.id)} label={t('delete')} confirm={t('confirmDelete')} />
              </li>
            ))}
          </ul>
        )}
        {staff.length > 0 && (
          <ActionForm action={addAwayAction} submitLabel={t('add')} resetOnSuccess className="grid gap-3 sm:grid-cols-4">
            <Field label={t('staff')}>
              <select name="staffId" className="field">{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </Field>
            <Field label={t('from')}><input name="start" type="datetime-local" required className="field" /></Field>
            <Field label={t('to')}><input name="end" type="datetime-local" required className="field" /></Field>
            <Field label={t('reason')}><input name="reason" className="field" /></Field>
          </ActionForm>
        )}
      </Panel>
    </div>
  );
}
