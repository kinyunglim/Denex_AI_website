import { z } from 'zod';

/**
 * Client-owned website copy, one file per locale in `content/<locale>.json`.
 * UI chrome (buttons, labels) lives in `messages/` instead.
 */
export const SiteContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().default(''),
    title: z.string(),
    subtitle: z.string(),
    cta: z.string(),
    image: z.string().default(''),
  }),
  services: z.object({
    title: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        price: z.string().default(''),
      })
    ),
  }),
  cases: z.object({
    title: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        image: z.string().default(''),
      })
    ),
  }),
  about: z.object({
    title: z.string(),
    body: z.string(),
    image: z.string().default(''),
  }),
  contact: z.object({
    title: z.string(),
    body: z.string(),
  }),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
