import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Catalog module (ported from OceanLink): `catalog_products` + `catalog_inquiries`.
 */
const Localized = z.object({
  'zh-Hant': z.string().optional(),
  'zh-Hans': z.string().optional(),
  en: z.string().optional(),
});

const SpecSchema = z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(200) });

export const ProductSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: Localized,
  description: Localized,
  category: z.string(),
  image: z.string(),
  specs: z.array(SpecSchema),
  active: z.boolean(),
  order: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductInputSchema = z.object({
  name: Localized.refine((n) => Object.values(n).some((v) => v && v.trim()), { message: 'Name is required' }),
  description: Localized.default({}),
  category: z.string().trim().max(60).default(''),
  image: z.string().trim().max(500).default(''),
  specs: z.array(SpecSchema).max(30).default([]),
  active: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});
export type ProductInput = z.input<typeof ProductInputSchema>;

export const InquirySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  productId: z.instanceof(ObjectId).nullable(),
  productName: z.string(),
  contactId: z.instanceof(ObjectId),
  quantity: z.string(),
  message: z.string(),
  handled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});
export type Inquiry = z.infer<typeof InquirySchema>;

const blank = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

export const InquiryInputSchema = z
  .object({
    productId: z.preprocess(blank, z.string().refine(ObjectId.isValid).optional()),
    name: z.string().trim().min(1).max(120),
    company: z.string().trim().max(120).default(''),
    phone: z.preprocess(blank, z.string().trim().max(40).optional()),
    email: z.preprocess(blank, z.string().trim().email().optional()),
    quantity: z.string().trim().max(120).default(''),
    message: z.string().trim().max(3000).default(''),
    locale: z.string().max(10).default('en'),
    website: z.string().optional(),
  })
  .refine((v) => v.phone || v.email, { message: 'phoneOrEmail', path: ['phone'] });
export type InquiryInput = z.input<typeof InquiryInputSchema>;

export type ProductSummary = {
  id: string;
  name: { 'zh-Hant'?: string; 'zh-Hans'?: string; en?: string };
  description: { 'zh-Hant'?: string; 'zh-Hans'?: string; en?: string };
  category: string;
  image: string;
  specs: { label: string; value: string }[];
  active: boolean;
  order: number;
};

export type InquirySummary = {
  id: string;
  productId: string | null;
  productName: string;
  contactId: string;
  quantity: string;
  message: string;
  handled: boolean;
  createdAt: string;
};
