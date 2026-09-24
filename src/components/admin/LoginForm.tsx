'use client';

import { FormEvent, useState } from 'react';

type Strings = Record<'email' | 'password' | 'signIn' | 'verify' | 'code' | 'codeSent' | 'back', string>;
type Api = { ok: true; data: { mfaRequired?: boolean } } | { ok: false; error: { message: string } };

/** Two-step admin login: password, then emailed OTP. Session is an httpOnly cookie. */
export function LoginForm({ s }: { s: Strings }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function post(url: string, body: object): Promise<Api> {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return (await res.json()) as Api;
  }

  async function onPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const result = await post('/api/admin/auth/login', { email: form.get('email'), password: form.get('password') }).catch(() => null);
    setBusy(false);
    if (!result) return setError('Network error');
    if (!result.ok) return setError(result.error.message);
    if (result.data.mfaRequired) {
      setEmail(String(form.get('email')));
      setStep(2);
    } else {
      window.location.href = '/admin';
    }
  }

  async function onCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const result = await post('/api/admin/auth/verify-otp', { email, code: form.get('code') }).catch(() => null);
    setBusy(false);
    if (!result) return setError('Network error');
    if (!result.ok) return setError(result.error.message);
    window.location.href = '/admin';
  }

  return step === 1 ? (
    <form onSubmit={onPassword} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-muted">{s.email}</label>
        <input id="login-email" name="email" required autoComplete="username" className="field" />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1 block text-xs font-semibold text-muted">{s.password}</label>
        <input id="login-password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      {error && <p className="text-sm text-primary" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">{s.signIn}</button>
    </form>
  ) : (
    <form onSubmit={onCode} className="space-y-4">
      <p className="text-sm text-muted">{s.codeSent}</p>
      <div>
        <label htmlFor="login-code" className="mb-1 block text-xs font-semibold text-muted">{s.code}</label>
        <input id="login-code" name="code" required inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="field text-center text-xl tracking-[0.5em]" />
      </div>
      {error && <p className="text-sm text-primary" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">{s.verify}</button>
      <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-muted hover:text-ink">{s.back}</button>
    </form>
  );
}
