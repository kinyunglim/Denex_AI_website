import { z } from 'zod';
import { SiteContentSchema } from '@/src/lib/content';

/**
 * Demo data shipped with each theme (`demo/<theme>.json`).
 * Used by preview mode (read-only showcase) and `yarn seed:demo`.
 */
const LocalizedText = z.object({
  'zh-Hant': z.string().optional(),
  'zh-Hans': z.string().optional(),
  en: z.string().optional(),
});

export const DemoDataSchema = z.object({
  business: z.object({
    name: LocalizedText,
    phone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    address: LocalizedText,
    logo: z.string(),
  }),
  content: z.object({
    'zh-Hant': SiteContentSchema,
    'zh-Hans': SiteContentSchema,
    en: SiteContentSchema,
  }),
  booking: z.object({
    services: z.array(
      z.object({
        key: z.string(),
        name: LocalizedText,
        durationMin: z.number().int().positive(),
        price: z.number().nonnegative(),
      })
    ),
    staff: z.array(
      z.object({
        key: z.string(),
        name: z.string(),
        services: z.array(z.string()),
        hours: z.array(
          z.object({
            weekday: z.number().int().min(0).max(6),
            startMin: z.number().int(),
            endMin: z.number().int(),
          })
        ),
      })
    ),
  }),
  products: z.array(
    z.object({
      name: LocalizedText,
      description: LocalizedText,
      category: z.string(),
      image: z.string().default(''),
      specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    })
  ),
  contacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      tags: z.array(z.string()).default([]),
      status: z.enum(['lead', 'active', 'inactive']).default('lead'),
    })
  ),
});

export type DemoData = z.infer<typeof DemoDataSchema>;
