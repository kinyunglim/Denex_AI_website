import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * `form_submissions`: every public contact-form message, linked to a CRM contact.
 */
export const SubmissionSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  message: z.string(),
  locale: z.string(),
  contactId: z.instanceof(ObjectId),
  handled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});
export type Submission = z.infer<typeof SubmissionSchema>;

const blankToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

export const ContactFormInputSchema = z
  .object({
    name: z.string().trim().min(1, { message: 'required' }).max(120),
    phone: z.preprocess(blankToUndefined, z.string().trim().max(40).optional()),
    email: z.preprocess(blankToUndefined, z.string().trim().email({ message: 'email' }).optional()),
    message: z.string().trim().min(1, { message: 'required' }).max(5000),
    locale: z.string().max(10).default('zh-Hant'),
    /** Honeypot: humans never see this field, bots fill it in. */
    website: z.string().optional(),
  })
  .refine((v) => v.phone || v.email, { message: 'phoneOrEmail', path: ['phone'] });
export type ContactFormInput = z.input<typeof ContactFormInputSchema>;

export type SubmissionSummary = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  locale: string;
  contactId: string;
  handled: boolean;
  createdAt: string;
};
