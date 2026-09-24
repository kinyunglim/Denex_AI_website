'use client';

import { useLocale, useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';

type ApiError = { ok: false; error: { message: string; fields?: Record<string, string[]> } };

/** Product enquiry → POST /api/catalog/inquiry. */
export function InquiryForm({ productId }: { productId: string }) {
  const t = useTranslations('catalog');
  const tc = useTranslations('contact');
  const locale = useLocale();
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/catalog/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form).entries()), productId, locale }),
      });
      if (res.ok) {
        setState('done');
        return;
      }
      const body = (await res.json()) as ApiError;
      setError(body.error.fields?.phone?.includes('phoneOrEmail') ? tc('phoneOrEmail') : tc('error'));
    } catch {
      setError(tc('error'));
    }
    setState('idle');
  }

  if (state === 'done') return <p className="text-ink" role="status">{t('success')}</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="iq-name" className="mb-1 block text-sm text-ink">{tc('name')} *</label>
        <input id="iq-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="iq-company" className="mb-1 block text-sm text-ink">{t('company')}</label>
        <input id="iq-company" name="company" className="field" autoComplete="organization" />
      </div>
      <div>
        <label htmlFor="iq-phone" className="mb-1 block text-sm text-ink">{tc('phone')}</label>
        <input id="iq-phone" name="phone" type="tel" className="field" autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="iq-email" className="mb-1 block text-sm text-ink">{tc('email')}</label>
        <input id="iq-email" name="email" type="email" className="field" autoComplete="email" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="iq-qty" className="mb-1 block text-sm text-ink">{t('quantity')}</label>
        <input id="iq-qty" name="quantity" className="field" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="iq-msg" className="mb-1 block text-sm text-ink">{t('message')}</label>
        <textarea id="iq-msg" name="message" rows={3} className="field" />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {error && <p className="text-sm text-primary sm:col-span-2" role="alert">{error}</p>}
      <button type="submit" className="btn-primary sm:col-span-2" disabled={state === 'sending'}>
        {state === 'sending' ? tc('sending') : t('submit')}
      </button>
    </form>
  );
}
