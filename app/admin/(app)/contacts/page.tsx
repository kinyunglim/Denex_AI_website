import Link from 'next/link';
import { getAdminT } from '@/src/lib/admin-i18n';
import { fmtDate } from '@/src/lib/admin-format';
import { CrmService } from '@/src/modules/crm/crm.service';
import { CONTACT_STATUSES, ContactStatus } from '@/src/modules/crm/crm.model';
import { ActionForm } from '@/src/components/admin/ActionForm';
import { Badge, Empty, Field, PageHeader, Panel, Table } from '@/src/components/admin/ui';
import { createContactAction } from '../actions';

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const t = await getAdminT();
  const status = (CONTACT_STATUSES as readonly string[]).includes(sp.status ?? '') ? (sp.status as ContactStatus) : undefined;
  const page = Math.max(Number(sp.page) || 1, 1);
  const result = await CrmService.listContacts({ search: sp.q, status, page, limit: 25 });
  const statusLabel = (s: ContactStatus) => (s === 'lead' ? t('lead') : s === 'active' ? t('active') : t('inactive'));
  const qs = (p: number) => `?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(status ? { status } : {}), page: String(p) })}`;

  return (
    <div className="space-y-6">
      <PageHeader title={`${t('contacts')} (${result.total})`} />
      <form className="flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={sp.q} placeholder={`${t('name')} / ${t('phone')} / ${t('email')}`} className="field max-w-sm" />
        <select name="status" defaultValue={status ?? ''} className="field w-auto">
          <option value="">{t('all')}</option>
          {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <button type="submit" className="btn-ghost">{t('search')}</button>
      </form>

      <Panel>
        {result.items.length === 0 ? (
          <Empty>{t('none')}</Empty>
        ) : (
          <Table head={[t('name'), t('phone'), t('email'), t('tags'), t('status'), t('created')]}>
            {result.items.map((c) => (
              <tr key={c.id} className="hover:bg-surface-alt">
                <td className="px-3 py-2"><Link href={`/admin/contacts/${c.id}`} className="font-semibold text-ink hover:text-primary">{c.name}</Link></td>
                <td className="px-3 py-2 text-muted">{c.phone ?? '—'}</td>
                <td className="px-3 py-2 text-muted">{c.email ?? '—'}</td>
                <td className="px-3 py-2">{c.tags.map((tag) => <span key={tag} className="mr-1"><Badge tone="muted">{tag}</Badge></span>)}</td>
                <td className="px-3 py-2"><Badge tone={c.status === 'active' ? 'primary' : 'neutral'}>{statusLabel(c.status)}</Badge></td>
                <td className="px-3 py-2 text-muted">{fmtDate(c.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )}
        {result.pages > 1 && (
          <div className="mt-4 flex items-center justify-end gap-3 text-sm">
            {page > 1 && <Link href={qs(page - 1)} className="text-primary">←</Link>}
            <span className="text-muted">{t('page')} {page} {t('of')} {result.pages}</span>
            {page < result.pages && <Link href={qs(page + 1)} className="text-primary">→</Link>}
          </div>
        )}
      </Panel>

      <Panel title={t('newContact')}>
        <ActionForm action={createContactAction} submitLabel={t('add')} resetOnSuccess className="grid gap-3 sm:grid-cols-2">
          <Field label={`${t('name')} *`}><input name="name" required className="field" /></Field>
          <Field label={t('phone')}><input name="phone" className="field" /></Field>
          <Field label={t('email')}><input name="email" type="email" className="field" /></Field>
          <Field label={t('whatsapp')}><input name="whatsapp" className="field" /></Field>
          <Field label={t('tags')} hint={t('tagsHint')}><input name="tags" className="field" /></Field>
          <Field label={t('status')}>
            <select name="status" className="field">{CONTACT_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select>
          </Field>
        </ActionForm>
      </Panel>
    </div>
  );
}
