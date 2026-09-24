import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminSession } from '@/src/lib/admin-session';
import { getAdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { fmtDateTime, fmtMoney } from '@/src/lib/admin-format';
import { CrmService } from '@/src/modules/crm/crm.service';
import { CONTACT_STATUSES, ContactStatus } from '@/src/modules/crm/crm.model';
import { ContactFormService } from '@/src/modules/contact-form/contact-form.service';
import { BookingService } from '@/src/modules/booking/booking.service';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { PAYMENT_METHODS } from '@/src/modules/payments/payments.model';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { ActionForm } from '@/src/components/admin/ActionForm';
import { ActionButton } from '@/src/components/admin/ActionButton';
import { Badge, Empty, Field, PageHeader, Panel } from '@/src/components/admin/ui';
import { addNoteAction, createStripeLinkAction, deleteContactAction, recordPaymentAction, updateContactAction } from '../../actions';

type Entry = { at: string; kind: string; text: string; href?: string };

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await CrmService.getContact(id).catch(() => null);
  if (!contact) notFound();
  const t = await getAdminT();
  const session = await getAdminSession();
  const owner = session?.role === 'owner';
  const cfg = getConfig();
  const lang = cfg.locales[0];

  const [notes, submissions, appointments, payments, inquiries, services] = await Promise.all([
    CrmService.listNotes(id),
    ContactFormService.listForContact(id),
    cfg.modules.booking ? BookingService.listForContact(id) : Promise.resolve([]),
    cfg.modules.payments && owner ? PaymentsService.listForContact(id) : Promise.resolve([]),
    cfg.modules.catalog ? CatalogService.listInquiriesForContact(id) : Promise.resolve([]),
    cfg.modules.booking ? BookingService.listServices(false) : Promise.resolve([]),
  ]);
  const serviceName = (sid: string) => pickLocalized(services.find((s) => s.id === sid)?.name, lang);

  const timeline: Entry[] = [
    ...notes.map((n) => ({ at: n.createdAt, kind: t('notes'), text: `${n.body} — ${n.author}` })),
    ...submissions.map((s) => ({ at: s.createdAt, kind: t('form'), text: s.message })),
    ...appointments.map((a) => ({ at: a.start, kind: t('bookings'), text: `${serviceName(a.serviceId)} · ${a.status}` })),
    ...payments.map((p) => ({ at: p.paidAt, kind: t('payments'), text: `${fmtMoney(p.amount)} · ${p.method} · ${p.receiptNo}`, href: `/admin/payments/${p.id}/receipt` })),
    ...inquiries.map((q) => ({ at: q.createdAt, kind: t('inquiry'), text: `${q.productName || '—'} ${q.quantity} ${q.message}` })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const statusLabel = (s: ContactStatus) => (s === 'lead' ? t('lead') : s === 'active' ? t('active') : t('inactive'));

  return (
    <div className="space-y-6">
      <PageHeader
        title={contact.name}
        actions={
          <>
            {contact.whatsapp || contact.phone ? (
              <a href={`https://wa.me/${(contact.whatsapp ?? contact.phone ?? '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-ghost !py-2">WhatsApp</a>
            ) : null}
            {owner && <ActionButton action={deleteContactAction.bind(null, id)} label={t('delete')} confirm={t('confirmDelete')} className="btn-ghost !py-2" />}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Panel title={t('edit')}>
            <ActionForm action={updateContactAction.bind(null, id)} submitLabel={t('save')}>
              <Field label={t('name')}><input name="name" defaultValue={contact.name} required className="field" /></Field>
              <Field label={t('phone')}><input name="phone" defaultValue={contact.phone ?? ''} className="field" /></Field>
              <Field label={t('email')}><input name="email" defaultValue={contact.email ?? ''} className="field" /></Field>
              <Field label={t('whatsapp')}><input name="whatsapp" defaultValue={contact.whatsapp ?? ''} className="field" /></Field>
              <Field label={t('tags')} hint={t('tagsHint')}><input name="tags" defaultValue={contact.tags.join(', ')} className="field" /></Field>
              <Field label={t('status')}>
                <select name="status" defaultValue={contact.status} className="field">
                  {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </Field>
              <p className="text-xs text-muted">{t('source')}: {contact.source} · {t('created')}: {fmtDateTime(contact.createdAt)}</p>
            </ActionForm>
          </Panel>

          {cfg.modules.payments && owner && (
            <Panel title={t('recordPayment')}>
              <ActionForm action={recordPaymentAction} submitLabel={t('save')} resetOnSuccess>
                <input type="hidden" name="contactId" value={id} />
                <Field label={`${t('amount')} (${cfg.currency})`}><input name="amount" type="number" step="0.01" min="0.01" required className="field" /></Field>
                <Field label={t('method')}>
                  <select name="method" className="field">{PAYMENT_METHODS.filter((m) => m !== 'stripe').map((m) => <option key={m} value={m}>{m}</option>)}</select>
                </Field>
                <Field label={t('description')}><input name="description" className="field" /></Field>
                <Field label={t('ref')}><input name="ref" className="field" /></Field>
                <Field label={t('paidAt')}><input name="paidAt" type="date" className="field" /></Field>
              </ActionForm>
            </Panel>
          )}

          {cfg.modules.stripe && owner && (
            <Panel title={t('createLink')}>
              <ActionForm action={createStripeLinkAction} submitLabel={t('createLink')}>
                <input type="hidden" name="contactId" value={id} />
                <Field label={`${t('amount')} (${cfg.currency})`}><input name="amount" type="number" step="0.01" min="1" required className="field" /></Field>
                <Field label={t('description')}><input name="description" required className="field" /></Field>
              </ActionForm>
            </Panel>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Panel title={t('addNote')}>
            <ActionForm action={addNoteAction.bind(null, id)} submitLabel={t('add')} resetOnSuccess>
              <textarea name="body" required rows={3} className="field" />
            </ActionForm>
          </Panel>
          <Panel title={t('timeline')}>
            {timeline.length === 0 ? (
              <Empty>{t('none')}</Empty>
            ) : (
              <ol className="space-y-4">
                {timeline.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 shrink-0"><Badge tone="muted">{e.kind}</Badge></span>
                    <div className="min-w-0">
                      <p className="whitespace-pre-line text-sm text-ink">
                        {e.href ? <Link href={e.href} className="hover:text-primary">{e.text}</Link> : e.text}
                      </p>
                      <p className="text-xs text-muted">{fmtDateTime(e.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
