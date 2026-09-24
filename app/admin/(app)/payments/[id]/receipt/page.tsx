import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/src/lib/admin-session';
import { requireModulePage } from '@/src/lib/modules';
import { fmtDate, fmtMoney } from '@/src/lib/admin-format';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { PrintButton } from '@/src/components/admin/PrintButton';

/** Printable bilingual receipt (ported from OnMove's receipts). */
export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  requireModulePage('payments');
  await requireAdminPage('owner');
  const { id } = await params;
  const r = await PaymentsService.receipt(id).catch(() => null);
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
      <article className="card p-10 text-ink print:border-0 print:shadow-none">
        <header className="flex items-start justify-between border-b border-line pb-6">
          <div>
            <p className="heading text-2xl">{r.business.name}</p>
            <p className="mt-1 text-sm text-muted">{r.business.address}</p>
            <p className="text-sm text-muted">{r.business.phone} · {r.business.email}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">收據 RECEIPT</p>
            <p className="text-sm text-muted">{r.receiptNo}</p>
            <p className="text-sm text-muted">{fmtDate(r.paidAt)}</p>
          </div>
        </header>
        <section className="py-6 text-sm">
          <p className="text-muted">收款人 Received from</p>
          <p className="text-base font-semibold">{r.contactName}</p>
          <p className="text-muted">{[r.contactPhone, r.contactEmail].filter(Boolean).join(' · ')}</p>
        </section>
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr><th className="py-2">項目 Description</th><th className="py-2 text-right">金額 Amount</th></tr>
          </thead>
          <tbody>
            <tr className="border-b border-line"><td className="py-3">{r.description || '—'}</td><td className="py-3 text-right">{fmtMoney(r.amount)}</td></tr>
          </tbody>
          <tfoot>
            <tr><td className="py-3 text-right font-semibold">總數 Total</td><td className="py-3 text-right text-lg font-semibold">{fmtMoney(r.amount)}</td></tr>
          </tfoot>
        </table>
        <p className="mt-6 text-sm text-muted">付款方式 Payment method: {r.method}{r.ref && ` · ${r.ref}`}</p>
        <p className="mt-10 text-center text-xs text-muted">多謝惠顧 Thank you</p>
      </article>
    </div>
  );
}
