import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Payments module:
 *   pay_records   one row per payment received (manual or Stripe)
 *   pay_counters  atomic sequence for receipt numbers (R-2026-0001)
 */
export const PAYMENT_METHODS = ['cash', 'fps', 'payme', 'card', 'bank', 'stripe', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PaymentRecordSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  contactId: z.instanceof(ObjectId),
  amount: z.number().positive(),
  currency: z.string(),
  method: z.enum(PAYMENT_METHODS),
  ref: z.string(),
  description: z.string(),
  appointmentId: z.instanceof(ObjectId).nullable(),
  paidAt: z.date(),
  receiptNo: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});
export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;

export const RecordPaymentSchema = z.object({
  contactId: z.string().refine(ObjectId.isValid, { message: 'Invalid contact' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  method: z.enum(PAYMENT_METHODS),
  ref: z.string().trim().max(120).default(''),
  description: z.string().trim().max(300).default(''),
  appointmentId: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().refine(ObjectId.isValid, { message: 'Invalid appointment' }).optional()
  ),
  paidAt: z.coerce.date().optional(),
});
export type RecordPaymentInput = z.input<typeof RecordPaymentSchema>;

export type PaymentSummary = {
  id: string;
  contactId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  ref: string;
  description: string;
  appointmentId: string | null;
  paidAt: string;
  receiptNo: string;
};

export type Receipt = PaymentSummary & {
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  business: { name: string; address: string; phone: string; email: string };
};
