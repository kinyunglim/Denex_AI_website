import { requireAdminPage } from '@/src/lib/admin-session';
import { adminStrings, getAdminT } from '@/src/lib/admin-i18n';
import { PageHeader, Panel } from '@/src/components/admin/ui';
import { ImportWizard } from '@/src/components/admin/ImportWizard';

export default async function ImportPage() {
  await requireAdminPage('owner');
  const t = await getAdminT();
  const s = await adminStrings(['upload', 'uploadHint', 'mapColumns', 'notMapped', 'commit', 'rowsOk', 'rowsCreated', 'rowsFailed', 'row', 'name', 'phone', 'email', 'whatsapp', 'tags', 'status']);
  return (
    <div className="space-y-6">
      <PageHeader title={t('import')} actions={
          // Plain <a>: this is a file download from a route handler, not a page.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a href="/admin/export/contacts" className="btn-ghost !py-2">{t('exportContacts')}</a>
        } />
      <Panel>
        <ImportWizard s={s} />
      </Panel>
    </div>
  );
}
