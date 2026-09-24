import { ObjectId, WithId } from 'mongodb';
import { parseInput } from '@/src/lib/api';
import { NotFoundError } from '@/src/lib/errors';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { CrmService } from '@/src/modules/crm/crm.service';
import { PaymentDao } from './payments.dao';
import { PaymentRecord, PaymentSummary, Receipt, RecordPaymentInput, RecordPaymentSchema } from './payments.model';

const toSummary = (d: WithId<PaymentRecord>): PaymentSummary => ({
  id: d._id.toHexString(),
  contactId: d.contactId.toHexString(),
  amount: d.amount,
  currency: d.currency,
  method: d.method,
  ref: d.ref,
  description: d.description,
  appointmentId: d.appointmentId ? d.appointmentId.toHexString() : null,
  paidAt: d.paidAt.toISOString(),
  receiptNo: d.receiptNo,
});

/**
 * Payment records and printable receipts (owner-only in the admin).
 */
export class PaymentsService {
  static async record(input: RecordPaymentInput, by: string): Promise<PaymentSummary> {
    const data = parseInput(RecordPaymentSchema, input);
    await CrmService.getContact(data.contactId); // throws if missing
    const paidAt = data.paidAt ?? new Date();
    const year = paidAt.getUTCFullYear();
    const seq = await PaymentDao.nextSeq(`receipt-${year}`);
    const now = new Date();
    const doc: PaymentRecord = {
      contactId: new ObjectId(data.contactId),
      amount: Math.round(data.amount * 100) / 100,
      currency: getConfig().currency,
      method: data.method,
      ref: data.ref,
      description: data.description,
      appointmentId: data.appointmentId ? new ObjectId(data.appointmentId) : null,
      paidAt,
      receiptNo: `R-${year}-${String(seq).padStart(4, '0')}`,
      createdAt: now,
      updatedAt: now,
      createdBy: by,
    };
    const id = await PaymentDao.insertOne(doc);
    return toSummary({ ...doc, _id: id });
  }

  static async listRange(from: Date, to: Date): Promise<PaymentSummary[]> {
    return (await PaymentDao.findInRange(from, to)).map(toSummary);
  }

  static async listForContact(contactId: string): Promise<PaymentSummary[]> {
    return (await PaymentDao.findByContact(contactId)).map(toSummary);
  }

  static async total(from: Date, to: Date): Promise<number> {
    return PaymentDao.sumInRange(from, to);
  }

  static async receipt(id: string): Promise<Receipt> {
    const doc = await PaymentDao.findById(id);
    if (!doc) throw new NotFoundError('Payment not found');
    const contact = await CrmService.getContact(doc.contactId.toHexString());
    const cfg = getConfig();
    const locale = cfg.locales[0];
    return {
      ...toSummary(doc),
      contactName: contact.name,
      contactPhone: contact.phone,
      contactEmail: contact.email,
      business: {
        name: pickLocalized(cfg.business.name, locale),
        address: pickLocalized(cfg.business.address, locale),
        phone: cfg.business.phone,
        email: cfg.business.email,
      },
    };
  }
}
