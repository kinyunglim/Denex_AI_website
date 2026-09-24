import { redirect } from 'next/navigation';
import { getAdminSession } from '@/src/lib/admin-session';
import { adminStrings } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { LoginForm } from '@/src/components/admin/LoginForm';

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect('/admin');
  const cfg = getConfig();
  const s = await adminStrings(['loginTitle', 'email', 'password', 'signIn', 'verify', 'code', 'codeSent', 'back']);
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm text-muted">{pickLocalized(cfg.business.name, cfg.locales[0])}</p>
        <h1 className="mt-1 text-center text-2xl text-ink">{s.loginTitle}</h1>
        <div className="card mt-6 p-6">
          <LoginForm s={s} />
        </div>
      </div>
    </div>
  );
}
