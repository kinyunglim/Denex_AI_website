import Link from 'next/link';
import { getAdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { fmtDateTime } from '@/src/lib/admin-format';
import { ContactFormService } from '@/src/modules/contact-form/contact-form.service';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { ActionButton } from '@/src/components/admin/ActionButton';
import { Badge, Empty, PageHeader, Panel } from '@/src/components/admin/ui';
import { setInquiryHandledAction, setSubmissionHandledAction } from '../actions';

export default async function InboxPage() {
  const t = await getAdminT();
  const cfg = getConfig();
  const [submissions, inquiries] = await Promise.all([
    ContactFormService.listRecent(100),
    cfg.modules.catalog ? CatalogService.listInquiries(100) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t('inbox')} />
      <Panel title={t('formSubmissions')}>
        {submissions.length === 0 ? (
          <Empty>{t('none')}</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {submissions.map((s) => (
              <li key={s.id} className={`flex flex-wrap items-start justify-between gap-3 py-4 ${s.handled ? 'opacity-60' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <Link href={`/admin/contacts/${s.contactId}`} className="font-semibold text-ink hover:text-primary">{s.name}</Link>
                    <span className="ml-2 text-muted">{s.phone ?? ''} {s.email ?? ''}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink">{s.message}</p>
                  <p className="mt-1 text-xs text-muted">{fmtDateTime(s.createdAt)} · {s.locale}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={s.handled ? 'muted' : 'primary'}>{s.handled ? t('handled') : t('open')}</Badge>
                  <ActionButton action={setSubmissionHandledAction.bind(null, s.id, !s.handled)} label={s.handled ? t('markOpen') : t('markHandled')} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {cfg.modules.catalog && (
        <Panel title={t('productInquiries')}>
          {inquiries.length === 0 ? (
            <Empty>{t('none')}</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {inquiries.map((q) => (
                <li key={q.id} className={`flex flex-wrap items-start justify-between gap-3 py-4 ${q.handled ? 'opacity-60' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <Link href={`/admin/contacts/${q.contactId}`} className="font-semibold text-ink hover:text-primary">{q.productName || '—'}</Link>
                      {q.quantity && <span className="ml-2 text-muted">{t('quantity')}: {q.quantity}</span>}
                    </p>
                    {q.message && <p className="mt-1 whitespace-pre-line text-sm text-ink">{q.message}</p>}
                    <p className="mt-1 text-xs text-muted">{fmtDateTime(q.createdAt)}</p>
                  </div>
                  <ActionButton action={setInquiryHandledAction.bind(null, q.id, !q.handled)} label={q.handled ? t('markOpen') : t('markHandled')} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
