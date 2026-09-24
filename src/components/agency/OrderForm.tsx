'use client';

import { useLocale, useTranslations } from 'next-intl';
import { FormEvent, useMemo, useState } from 'react';
import { agency, AddOn, ModuleKey } from '@/agency.config';
import { quote } from '@/src/modules/orders/pricing';

type Lang = 'zh-Hant' | 'en';
type LocaleKey = 'zh-Hant' | 'zh-Hans' | 'en';
const LOCALE_KEYS: LocaleKey[] = ['zh-Hant', 'en', 'zh-Hans'];
type Api = { ok: true; data: { ref: string; checkoutUrl: string | null } } | { ok: false; error: { message: string; fields?: Record<string, string[]> } };

/**
 * Order configurator: plan → theme → languages → add-ons → details, with a
 * live price summary. The server recomputes the price; this total is a preview.
 */
export function OrderForm({ initialTheme, initialPackage, withDeposit, previewBaseUrl }: { initialTheme: string; initialPackage: string; withDeposit: boolean; previewBaseUrl: string }) {
  const t = useTranslations('agency');
  const tc = useTranslations('contact');
  const locale = useLocale();
  const lang: Lang = locale === 'en' ? 'en' : 'zh-Hant';
  const [pkg, setPkg] = useState(initialPackage);
  const [theme, setTheme] = useState(initialTheme);
  const [locales, setLocales] = useState<LocaleKey[]>(['zh-Hant', 'en']);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const money = useMemo(() => new Intl.NumberFormat(locale === 'en' ? 'en-HK' : 'zh-HK', { style: 'currency', currency: agency.currency, maximumFractionDigits: 0 }), [locale]);
  const q = useMemo(() => quote(pkg, addOns, locales.length), [pkg, addOns, locales]);
  const pkgModules: ModuleKey[] = agency.packages.find((p) => p.key === pkg)?.modules ?? [];
  const selectable = (agency.addOns as AddOn[]).filter((a) => a.key !== 'language');

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? '');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageKey: pkg,
          addOns,
          theme,
          locales,
          locale,
          business: {
            nameZhHant: s('nameZhHant'),
            nameEn: s('nameEn'),
            industry: s('industry'),
            phone: s('phone'),
            whatsapp: s('whatsapp'),
            email: s('businessEmail'),
            address: s('address'),
            domain: s('domain'),
          },
          customer: { name: s('customerName'), email: s('customerEmail'), phone: s('customerPhone') },
          notes: s('notes'),
          website: s('website'),
        }),
      });
      const body = (await res.json()) as Api;
      if (!body.ok) {
        setError(body.error.fields?.['business.nameEn'] ? t('businessName') : body.error.message);
        setBusy(false);
        return;
      }
      window.location.href = body.data.checkoutUrl ?? `/${locale}/order/${body.data.ref}`;
    } catch {
      setError(tc('error'));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-10 lg:col-span-2">
        <fieldset>
          <legend className="mb-3 text-lg font-semibold text-ink">{t('step1')}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {agency.packages.map((p) => (
              <button type="button" key={p.key} onClick={() => setPkg(p.key)} aria-pressed={pkg === p.key} className={`card p-4 text-left ${pkg === p.key ? 'ring-2 ring-primary' : 'hover:bg-surface-alt'}`}>
                <span className="block font-semibold text-ink">{p.name[lang]}</span>
                <span className="mt-1 block text-sm text-muted">{money.format(p.oneOff)} + {money.format(p.monthly)}{t('perMonth')}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-lg font-semibold text-ink">{t('step2')}</legend>
          <div className="grid gap-3 sm:grid-cols-4">
            {agency.themes.map((th) => (
              <div key={th.key} className={`card p-3 ${theme === th.key ? 'ring-2 ring-primary' : ''}`}>
                <button type="button" onClick={() => setTheme(th.key)} aria-pressed={theme === th.key} className="block w-full text-left">
                  <span className="block font-semibold text-ink">{th.name[lang]}</span>
                  <span className="block text-xs text-muted">{th.fit[lang]}</span>
                </button>
                <a href={`${previewBaseUrl}/${lang}?theme=${th.key}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-primary">{t('openFull')} ↗</a>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-lg font-semibold text-ink">{t('step3')}</legend>
          <div className="flex flex-wrap gap-3">
            {LOCALE_KEYS.map((l) => (
              <label key={l} className="flex items-center gap-2 rounded-button border border-line bg-surface px-4 py-2 text-sm text-ink">
                <input type="checkbox" checked={locales.includes(l)} onChange={() => setLocales((cur) => (cur.includes(l) && cur.length === 1 ? cur : toggle(cur, l)))} />
                {t(`langNames.${l}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-lg font-semibold text-ink">{t('step4')}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {selectable.map((a) => {
              const included = Boolean(a.module && pkgModules.includes(a.module));
              return (
                <label key={a.key} className={`flex items-start gap-3 rounded-input border border-line bg-surface p-3 text-sm ${included ? 'opacity-60' : ''}`}>
                  <input type="checkbox" className="mt-1" disabled={included} checked={included || addOns.includes(a.key)} onChange={() => setAddOns((cur) => toggle(cur, a.key))} />
                  <span className="flex-1">
                    <span className="block font-semibold text-ink">{a.name[lang]}</span>
                    <span className="block text-muted">{a.description[lang]}</span>
                  </span>
                  <span className="shrink-0 text-right text-ink">
                    {included ? t('included') : (
                      <>
                        {a.oneOff > 0 && <span className="block">{money.format(a.oneOff)}</span>}
                        {a.monthly > 0 && <span className="block text-muted">+{money.format(a.monthly)}{t('perMonth')}</span>}
                      </>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-lg font-semibold text-ink">{t('step5')}</legend>
          <label className="block text-sm text-ink">{t('nameZh')}<input name="nameZhHant" className="field mt-1" /></label>
          <label className="block text-sm text-ink">{t('nameEn')}<input name="nameEn" className="field mt-1" /></label>
          <label className="block text-sm text-ink sm:col-span-2">{t('industry')}<input name="industry" className="field mt-1" /></label>
          <label className="block text-sm text-ink">{tc('phone')}<input name="phone" type="tel" className="field mt-1" /></label>
          <label className="block text-sm text-ink">WhatsApp<input name="whatsapp" type="tel" className="field mt-1" /></label>
          <label className="block text-sm text-ink">{tc('email')}<input name="businessEmail" type="email" className="field mt-1" /></label>
          <label className="block text-sm text-ink">{t('domain')}<input name="domain" placeholder="www.example.hk" className="field mt-1" /></label>
          <label className="block text-sm text-ink sm:col-span-2">{t('address')}<input name="address" className="field mt-1" /></label>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-3 text-lg font-semibold text-ink">{t('step6')}</legend>
          <label className="block text-sm text-ink">{t('yourName')} *<input name="customerName" required className="field mt-1" autoComplete="name" /></label>
          <label className="block text-sm text-ink">{tc('email')} *<input name="customerEmail" type="email" required className="field mt-1" autoComplete="email" /></label>
          <label className="block text-sm text-ink">{tc('phone')}<input name="customerPhone" type="tel" className="field mt-1" autoComplete="tel" /></label>
          <label className="block text-sm text-ink sm:col-span-3">{t('notes')}<textarea name="notes" rows={3} className="field mt-1" /></label>
          <div aria-hidden="true" className="absolute -left-[9999px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <h2 className="text-lg text-ink">{t('summary')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {q.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="text-ink">{l.name[lang]}{l.qty > 1 ? ` × ${l.qty}` : ''}{l.auto ? <span className="block text-xs text-muted">{t('auto')}</span> : null}</span>
                <span className="shrink-0 text-right text-muted">{money.format(l.oneOff)}{l.monthly ? <span className="block">+{money.format(l.monthly)}</span> : null}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink">{t('total')}</dt><dd className="font-semibold text-ink">{money.format(q.oneOff)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink">{t('monthly')}</dt><dd className="text-ink">{money.format(q.monthly)}{t('perMonth')}</dd></div>
            {withDeposit && <div className="flex justify-between"><dt className="text-muted">{t('deposit')}</dt><dd className="text-muted">{money.format(q.deposit)}</dd></div>}
            <p className="pt-2 text-xs text-muted">{t('delivery', { n: q.deliveryDays })}</p>
          </dl>
          {error && <p className="mt-4 text-sm text-primary" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">{busy ? t('submitting') : withDeposit ? t('submitPay') : t('submit')}</button>
          <p className="mt-3 text-xs text-muted">{withDeposit ? t('termsNote') : t('termsNoteNoDeposit')}</p>
        </div>
      </aside>
    </form>
  );
}
