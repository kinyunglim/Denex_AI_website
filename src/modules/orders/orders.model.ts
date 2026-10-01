import { z } from 'zod';
import { ObjectId } from 'mongodb';
import type { Quote } from './pricing';
import { THEMES, type ThemeName } from '@/src/lib/config';

/**
 * `agency_orders`: one website order from a prospect, from checkout to delivery.
 */
export const ORDER_STATUSES = [
  'awaiting_payment', // Stripe checkout opened, not finished
  'submitted', // no-payment path: waiting for review
  'authorized', // deposit held on the card, waiting for review
  'approved', // owner approved (deposit captured) — worker will build it
  'in_production',
  'delivered',
  'failed',
  'rejected',
  'expired',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderHistory = { at: Date; status: OrderStatus; by: string; note?: string };

export type Order = {
  _id?: ObjectId;
  ref: string;
  packageKey: string;
  addOns: string[];
  theme: ThemeName;
  locales: ('zh-Hant' | 'zh-Hans' | 'en')[];
  business: {
    nameZhHant: string;
    nameEn: string;
    industry: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    domain: string;
  };
  customer: { name: string; email: string; phone: string };
  notes: string;
  contactId: ObjectId;
  quote: Quote;
  status: OrderStatus;
  stripe: { sessionId: string | null; paymentIntentId: string | null; checkoutUrl: string | null };
  production: { startedAt: Date | null; finishedAt: Date | null; dest: string | null; log: string; error: string | null };
  history: OrderHistory[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

const blank = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

export const OrderInputSchema = z
  .object({
    packageKey: z.string().min(1),
    addOns: z.array(z.string()).max(30).default([]),
    theme: z.enum(THEMES),
    locales: z.array(z.enum(['zh-Hant', 'zh-Hans', 'en'])).min(1).max(3),
    business: z.object({
      nameZhHant: z.string().trim().max(120).default(''),
      nameEn: z.string().trim().max(120).default(''),
      industry: z.string().trim().max(200).default(''),
      phone: z.string().trim().max(40).default(''),
      whatsapp: z.string().trim().max(40).default(''),
      email: z.preprocess(blank, z.string().trim().email().optional()),
      address: z.string().trim().max(300).default(''),
      domain: z.string().trim().max(120).default(''),
    }),
    customer: z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email(),
      phone: z.string().trim().max(40).default(''),
    }),
    notes: z.string().trim().max(3000).default(''),
    website: z.string().optional(),
  })
  .refine((o) => o.business.nameZhHant || o.business.nameEn, { message: 'businessName', path: ['business', 'nameEn'] })
  .refine((o) => new Set(o.locales).size === o.locales.length, { message: 'Duplicate language', path: ['locales'] });
export type OrderInput = z.input<typeof OrderInputSchema>;

export type OrderSummary = {
  id: string;
  ref: string;
  packageKey: string;
  addOns: string[];
  theme: Order['theme'];
  locales: Order['locales'];
  business: Order['business'];
  customer: Order['customer'];
  notes: string;
  contactId: string;
  quote: Quote;
  status: OrderStatus;
  checkoutUrl: string | null;
  paymentIntentId: string | null;
  production: { startedAt: string | null; finishedAt: string | null; dest: string | null; log: string; error: string | null };
  history: { at: string; status: OrderStatus; by: string; note?: string }[];
  createdAt: string;
};
