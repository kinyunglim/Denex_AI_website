'use client';

import { useLocale, useTranslations } from 'next-intl';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Localized = { 'zh-Hant'?: string; 'zh-Hans'?: string; en?: string };
type Service = { id: string; name: Localized; durationMin: number; price: number; staff: { id: string; name: string }[] };
type Slot = { staffId: string; staffName: string; start: string };
type Confirmation = { start: string; serviceName: string; staffName: string };
type Api<T> = { ok: true; data: T } | { ok: false; error: { message: string; fields?: Record<string, string[]> } };

const pick = (v: Localized, locale: string) =>
  (v as Record<string, string | undefined>)[locale] ?? v['zh-Hant'] ?? v.en ?? v['zh-Hans'] ?? '';

/** Local "YYYY-MM-DD" for a date offset from today in the business time zone. */
function dayInZone(offset: number, tz: string): string {
  const d = new Date(Date.now() + offset * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/**
 * Public booking flow: service → staff/date → time → details → confirmation.
 * Talks to /api/booking/*; the server re-checks the slot on submit.
 */
export function BookingWizard({ timezone, currency, maxDaysAhead }: { timezone: string; currency: string; maxDaysAhead: number }) {
  const t = useTranslations('booking');
  const tc = useTranslations('contact');
  const locale = useLocale();
  const [services, setServices] = useState<Service[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(() => dayInZone(1, timezone));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Confirmation | null>(null);
  const [reload, setReload] = useState(0);
  // Fetched slots and the picked slot are tagged with the query they belong to,
  // so changing service/staff/date simply makes them stale (no reset needed).
  const queryKey = `${serviceId}|${staffId}|${date}|${reload}`;
  const [fetched, setFetched] = useState<{ key: string; slots: Slot[] } | null>(null);
  const [picked, setPicked] = useState<{ key: string; slot: Slot } | null>(null);
  const slots = fetched?.key === queryKey ? fetched.slots : null;
  const slot = picked?.key === queryKey ? picked.slot : null;
  const setSlot = (s: Slot | null) => setPicked(s ? { key: queryKey, slot: s } : null);
  const setSlots = (update: (prev: Slot[] | null) => Slot[] | null) => {
    const next = update(slots);
    setFetched(next ? { key: queryKey, slots: next } : null);
  };

  const days = useMemo(() => Array.from({ length: Math.min(maxDaysAhead, 30) }, (_, i) => dayInZone(i, timezone)), [maxDaysAhead, timezone]);
  const service = services?.find((s) => s.id === serviceId);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(locale, { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }), [locale, timezone]);
  const dayFmt = useMemo(() => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }), [locale]);
  const fullFmt = useMemo(() => new Intl.DateTimeFormat(locale, { timeZone: timezone, dateStyle: 'full', timeStyle: 'short' }), [locale, timezone]);
  const money = useMemo(() => new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }), [locale, currency]);

  useEffect(() => {
    fetch('/api/booking/services')
      .then((r) => r.json() as Promise<Api<Service[]>>)
      .then((body) => {
        if (!body.ok) throw new Error(body.error.message);
        setServices(body.data);
        if (body.data[0]) setServiceId(body.data[0].id);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    const key = queryKey;
    const q = new URLSearchParams({ serviceId, date, ...(staffId ? { staffId } : {}) });
    fetch(`/api/booking/availability?${q}`)
      .then((r) => r.json() as Promise<Api<Slot[]>>)
      .then((body) => !cancelled && setFetched({ key, slots: body.ok ? body.data : [] }))
      .catch(() => !cancelled && setFetched({ key, slots: [] }));
    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, date, queryKey]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) return;
    setSubmitting(true);
    setError('');
    const form = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, serviceId, staffId: slot.staffId, start: slot.start, locale }),
      });
      const body = (await res.json()) as Api<Confirmation>;
      if (body.ok) {
        setDone(body.data);
      } else if (body.error.fields?.phone?.includes('phoneOrEmail')) {
        setError(tc('phoneOrEmail'));
      } else if (res.status === 409) {
        setError(t('taken'));
        setSlot(null);
        setSlots((prev) => prev?.filter((x) => x.start !== slot.start || x.staffId !== slot.staffId) ?? null);
      } else {
        setError(tc('error'));
      }
    } catch {
      setError(tc('error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) return <p className="card p-6 text-muted">{t('unavailable')}</p>;
  if (!services) return <p className="text-muted">{t('loading')}</p>;
  if (!services.length) return <p className="card p-6 text-muted">{t('unavailable')}</p>;

  if (done) {
    return (
      <div className="card p-8 text-center" role="status">
        <p className="heading text-3xl text-ink">{t('success')}</p>
        <p className="mt-4 whitespace-pre-line text-muted">
          {t('successBody', { service: done.serviceName, staff: done.staffName, when: fullFmt.format(new Date(done.start)) })}
        </p>
        <button type="button" className="btn-ghost mt-8" onClick={() => { setDone(null); setReload((n) => n + 1); }}>
          {t('another')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">{t('service')}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => { setServiceId(s.id); setStaffId(''); }}
              aria-pressed={s.id === serviceId}
              className={`card p-4 text-left transition-colors ${s.id === serviceId ? 'border-primary ring-1 ring-primary' : 'hover:bg-surface-alt'}`}
            >
              <span className="block font-semibold text-ink">{pick(s.name, locale)}</span>
              <span className="mt-1 block text-sm text-muted">
                {t('minutes', { n: s.durationMin })} · {s.price ? money.format(s.price) : t('free')}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {service && service.staff.length > 1 && (
        <div>
          <label htmlFor="bw-staff" className="mb-2 block text-sm font-semibold text-ink">{t('staff')}</label>
          <select id="bw-staff" className="field max-w-xs" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
            <option value="">{t('anyStaff')}</option>
            {service.staff.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">{t('date')}</legend>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {days.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setDate(d)}
              aria-pressed={d === date}
              className={`shrink-0 rounded-button border px-3 py-2 text-sm ${d === date ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink hover:bg-surface-alt'}`}
            >
              {dayFmt.format(new Date(`${d}T00:00:00Z`))}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">{t('time')}</legend>
        {slots === null ? (
          <p className="text-sm text-muted">{t('loading')}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted">{t('noSlots')}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((s) => {
              const active = slot?.start === s.start && slot.staffId === s.staffId;
              return (
                <button
                  type="button"
                  key={`${s.staffId}-${s.start}`}
                  onClick={() => setSlot(s)}
                  aria-pressed={active}
                  className={`rounded-button border px-2 py-2 text-sm ${active ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink hover:bg-surface-alt'}`}
                >
                  {timeFmt.format(new Date(s.start))}
                  {!staffId && service && service.staff.length > 1 && <span className="block text-xs opacity-75">{s.staffName}</span>}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {slot && (
        <form onSubmit={submit} className="card space-y-4 p-6">
          <p className="font-semibold text-ink">{t('yourDetails')}</p>
          <p className="text-sm text-muted">
            {service && pick(service.name, locale)} · {slot.staffName} · {fullFmt.format(new Date(slot.start))}
          </p>
          <div>
            <label htmlFor="bw-name" className="mb-1 block text-sm text-ink">{tc('name')} *</label>
            <input id="bw-name" name="name" required maxLength={120} className="field" autoComplete="name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bw-phone" className="mb-1 block text-sm text-ink">{tc('phone')}</label>
              <input id="bw-phone" name="phone" type="tel" className="field" autoComplete="tel" />
            </div>
            <div>
              <label htmlFor="bw-email" className="mb-1 block text-sm text-ink">{tc('email')}</label>
              <input id="bw-email" name="email" type="email" className="field" autoComplete="email" />
            </div>
          </div>
          <div>
            <label htmlFor="bw-notes" className="mb-1 block text-sm text-ink">{t('notes')}</label>
            <textarea id="bw-notes" name="notes" rows={3} maxLength={1000} className="field" />
          </div>
          <div aria-hidden="true" className="absolute -left-[9999px]">
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {error && <p className="text-sm text-primary" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? t('booking') : t('confirm')}
          </button>
        </form>
      )}
    </div>
  );
}
