'use client';

import { useLocale, useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';

type Status = { kind: 'idle' | 'sending' | 'done' } | { kind: 'error'; message: string };

type ApiError = { ok: false; error: { code: string; message: string; fields?: Record<string, string[]> } };

/** Public contact form → POST /api/contact. Includes a hidden honeypot field. */
export function ContactForm() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      });
      if (res.ok) {
        form.reset();
        setStatus({ kind: 'done' });
        return;
      }
      const body = (await res.json()) as ApiError;
      const fields = body.error.fields ?? {};
      let message = t('error');
      if (res.status === 429) message = t('tooMany');
      else if (fields.phone?.includes('phoneOrEmail')) message = t('phoneOrEmail');
      else if (fields.email) message = t('invalidEmail');
      setStatus({ kind: 'error', message });
    } catch {
      setStatus({ kind: 'error', message: t('error') });
    }
  }

  if (status.kind === 'done') {
    return <p className="py-10 text-center text-lg text-ink" role="status">{t('success')}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      <div>
        <label htmlFor="cf-name" className="mb-1 block text-sm font-medium text-ink">{t('name')} *</label>
        <input id="cf-name" name="name" required maxLength={120} className="field" autoComplete="name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-phone" className="mb-1 block text-sm font-medium text-ink">{t('phone')}</label>
          <input id="cf-phone" name="phone" type="tel" maxLength={40} className="field" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1 block text-sm font-medium text-ink">{t('email')}</label>
          <input id="cf-email" name="email" type="email" maxLength={200} className="field" autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className="mb-1 block text-sm font-medium text-ink">{t('message')} *</label>
        <textarea id="cf-message" name="message" required rows={4} maxLength={5000} className="field" />
      </div>
      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {status.kind === 'error' && <p className="text-sm text-primary" role="alert">{status.message}</p>}
      <button type="submit" className="btn-primary w-full" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? t('sending') : t('submit')}
      </button>
    </form>
  );
}
