import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * CRM models: `crm_contacts` (every person the business deals with) and
 * `crm_notes` (timeline notes on a contact). Other modules link to contacts
 * through CrmService.findOrCreateContact — never by touching these collections.
 */
export const CONTACT_SOURCES = ['form', 'import', 'manual', 'booking', 'catalog'] as const;
export const CONTACT_STATUSES = ['lead', 'active', 'inactive'] as const;
export type ContactSource = (typeof CONTACT_SOURCES)[number];
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const ContactSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  whatsapp: z.string().nullable(),
  tags: z.array(z.string()),
  source: z.enum(CONTACT_SOURCES),
  status: z.enum(CONTACT_STATUSES),
  locale: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const NoteSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  contactId: z.instanceof(ObjectId),
  body: z.string().min(1),
  author: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});
export type Note = z.infer<typeof NoteSchema>;

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : undefined));

export const ContactInputSchema = z
  .object({
    name: z.string().trim().min(1, { message: 'Name is required' }).max(120),
    phone: optionalText,
    email: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .pipe(z.string().email({ message: 'Invalid email' }).optional()),
    whatsapp: optionalText,
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    status: z.enum(CONTACT_STATUSES).default('lead'),
    locale: z.string().optional(),
  })
  .refine((v) => v.phone || v.email, { message: 'Phone or email is required', path: ['phone'] });
export type ContactInput = z.input<typeof ContactInputSchema>;

export const ContactUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(200).optional(),
  email: z.string().trim().max(200).optional(),
  whatsapp: z.string().trim().max(200).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  status: z.enum(CONTACT_STATUSES).optional(),
});
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>;

export const NoteInputSchema = z.object({ body: z.string().trim().min(1).max(5000) });

export type ContactSummary = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  tags: string[];
  source: ContactSource;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
};

export type NoteSummary = { id: string; body: string; author: string; createdAt: string };

export type ContactQuery = { search?: string; status?: ContactStatus; tag?: string; page?: number; limit?: number };
