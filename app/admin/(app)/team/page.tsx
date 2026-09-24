import { requireAdminPage } from '@/src/lib/admin-session';
import { getAdminT } from '@/src/lib/admin-i18n';
import { fmtDateTime } from '@/src/lib/admin-format';
import { AdminService } from '@/src/services/admin.service';
import { ActionForm } from '@/src/components/admin/ActionForm';
import { ActionButton } from '@/src/components/admin/ActionButton';
import { Badge, Empty, Field, PageHeader, Panel } from '@/src/components/admin/ui';
import { createAdminAction, deleteAdminAction, updateAdminAction } from '../actions';

export default async function TeamPage() {
  const session = await requireAdminPage('owner');
  const t = await getAdminT();
  const admins = await AdminService.list();

  return (
    <div className="space-y-6">
      <PageHeader title={t('team')} />
      <Panel>
        {admins.length === 0 ? (
          <Empty>{t('none')}</Empty>
        ) : (
          <div className="space-y-3">
            {admins.map((a) => (
              <details key={a.id} className="rounded-input border border-line p-3">
                <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-ink">{a.name}</span>
                  <span className="text-muted">{a.email}</span>
                  <Badge tone={a.role === 'owner' ? 'primary' : 'muted'}>{a.role === 'owner' ? t('owner') : t('staffRole')}</Badge>
                  {!a.isActive && <Badge>{t('inactive')}</Badge>}
                  <span className="text-xs text-muted">{t('lastLogin')}: {a.lastLogin ? fmtDateTime(a.lastLogin) : '—'}</span>
                </summary>
                <ActionForm action={updateAdminAction.bind(null, a.id)} submitLabel={t('save')} className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label={t('role')}>
                    <select name="role" defaultValue={a.role} className="field">
                      <option value="owner">{t('owner')}</option>
                      <option value="staff">{t('staffRole')}</option>
                    </select>
                  </Field>
                  <Field label={t('password')}><input name="password" type="password" minLength={10} autoComplete="new-password" className="field" /></Field>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink"><input type="checkbox" name="isActive" defaultChecked={a.isActive} /> {t('active')}</label>
                </ActionForm>
                {a.id !== session.adminId && (
                  <div className="mt-3"><ActionButton action={deleteAdminAction.bind(null, a.id)} label={t('delete')} confirm={t('confirmDelete')} /></div>
                )}
              </details>
            ))}
          </div>
        )}
      </Panel>
      <Panel title={t('newAdmin')}>
        <ActionForm action={createAdminAction} submitLabel={t('add')} resetOnSuccess className="grid gap-3 sm:grid-cols-2">
          <Field label={t('name')}><input name="name" required minLength={2} className="field" /></Field>
          <Field label={t('email')}><input name="email" type="email" required className="field" /></Field>
          <Field label={t('password')}><input name="password" type="password" required minLength={10} autoComplete="new-password" className="field" /></Field>
          <Field label={t('role')}>
            <select name="role" defaultValue="staff" className="field">
              <option value="staff">{t('staffRole')}</option>
              <option value="owner">{t('owner')}</option>
            </select>
          </Field>
        </ActionForm>
      </Panel>
    </div>
  );
}
