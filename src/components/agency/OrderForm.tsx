'use client';

import { useLocale, useTranslations } from 'next-intl';
import { FormEvent, useMemo, useState } from 'react';
import { agency } from '@/agency.config';
import { quote } from '@/src/modules/orders/pricing';
import { Shot } from './visuals';

type Lang = 'zh-Hant' | 'en';
type LocaleKey = 'zh-Hant' | 'zh-Hans' | 'en';
const LOCALE_KEYS: LocaleKey[] = ['zh-Hant', 'en', 'zh-Hans'];
type Api = { ok: true; data: { ref: string; checkoutUrl: string | null } } | { ok: false; error: { message: string; fields?: Record<string, string[]> } };

/**
 * Order configurator: plan → theme → languages → details, with a
 * live price summary. The server recomputes the price; this total is a preview.
 */
export function OrderForm({ initialTheme, initialPackage, withDeposit }: { initialTheme: string; initialPackage: string; withDeposit: boolean }) {
  const t = useTranslations('agency');
  const tc = useTranslations('contact');
  const locale = useLocale();
  const lang: Lang = locale === 'en' ? 'en' : 'zh-Hant';
  const [pkg, setPkg] = useState(initialPackage);
  const [theme, setTheme] = useState(initialTheme);
  const [locales, setLocales] = useState<LocaleKey[]>(initialPackage === 'starter' ? [lang === 'en' ? 'en' : 'zh-Hant'] : initialPackage === 'pro' ? [...LOCALE_KEYS] : ['zh-Hant', 'en']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const money = useMemo(() => new Intl.NumberFormat(locale === 'en' ? 'en-HK' : 'zh-HK', { style: 'currency', currency: agency.currency, maximumFractionDigits: 0 }), [locale]);
  const selectedPackage = agency.packages.find(p => p.key === pkg)!;
  const q = useMemo(() => quote(pkg, [], locales.length), [pkg, locales]);
  function selectPackage(key: string) {
    const …2053 tokens truncated…  {q.lines.map((l) => (
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

          </dl>
          <p className="mt-3 text-xs text-muted">{t('delivery', { n: q.deliveryDays })}</p>
          <p className="mt-3 text-xs text-muted">{t('packageFeeNote')}</p>
          {error && <p className="mt-4 text-sm text-primary" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">{busy ? t('submitting') : withDeposit ? t('submitPay') : t('submit')}</button>
          <p className="mt-3 text-xs text-muted">{withDeposit ? t('termsNote') : t('termsNoteNoDeposit')}</p>
        </div>
      </aside>
    </form>
  );
}
