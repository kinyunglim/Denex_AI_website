import { z } from 'zod';

/**
 * Client configuration schema.
 * Approach: every per-client difference lives in `client.config.ts` and is
 * validated here, so a typo fails the build instead of shipping a broken site.
 */
export const LOCALES = ['zh-Hant', 'zh-Hans', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const THEMES = ['corporate', 'warm', 'product', 'bold'] as const;
export type ThemeName = (typeof THEMES)[number];

export const MODULE_NAMES = ['booking', 'payments', 'stripe', 'gcal', 'catalog', 'mobile'] as const;
export type ModuleName = (typeof MODULE_NAMES)[number];

export const SECTIONS = ['hero', 'services', 'cases', 'about', 'contact'] as const;
export type SectionName = (typeof SECTIONS)[number];

/** Optional modules that only work when another module is also on. */
export const MODULE_DEPS: Partial<Record<ModuleName, ModuleName>> = {
  stripe: 'payments',
  gcal: 'booking',
};

const LocalizedSchema = z.object({
  'zh-Hant': z.string().optional(),
  'zh-Hans': z.string().optional(),
  en: z.string().optional(),
});
export type Localized = z.infer<typeof LocalizedSchema>;

export const ClientConfigSchema = z
  .object({
    business: z.object({
      name: LocalizedSchema,
      phone: z.string().default(''),
      whatsapp: z.string().default(''),
      email: z.string().default(''),
      address: LocalizedSchema.default({}),
      logo: z.string().default('/logo.svg'),
    }),
    locales: z.array(z.enum(LOCALES)).min(1, { message: 'At least one locale is required' }),
    theme: z.enum(THEMES),
    modules: z.object({
      booking: z.boolean().default(false),
      payments: z.boolean().default(false),
      stripe: z.boolean().default(false),
      gcal: z.boolean().default(false),
      catalog: z.boolean().default(false),
      mobile: z.boolean().default(false),
    }),
    sections: z.array(z.enum(SECTIONS)).min(1),
    notify: z.object({ email: z.array(z.string().email()).default([]) }),
    timezone: z.string().default('Asia/Hong_Kong'),
    currency: z.string().default('HKD'),
    booking: z
      .object({
        slotStepMin: z.number().int().min(5).max(120).default(30),
        minNoticeMin: z.number().int().min(0).default(120),
        maxDaysAhead: z.number().int().min(1).max(365).default(60),
      })
      .default({ slotStepMin: 30, minNoticeMin: 120, maxDaysAhead: 60 }),
  })
  .superRefine((cfg, ctx) => {
    for (const [mod, needs] of Object.entries(MODULE_DEPS) as [ModuleName, ModuleName][]) {
      if (cfg.modules[mod] && !cfg.modules[needs]) {
        ctx.addIssue({
          code: 'custom',
          path: ['modules', mod],
          message: `Module "${mod}" requires module "${needs}" to be enabled`,
        });
      }
    }
    if (new Set(cfg.locales).size !== cfg.locales.length) {
      ctx.addIssue({ code: 'custom', path: ['locales'], message: 'Duplicate locale' });
    }
    const primary = cfg.locales[0];
    if (primary && !cfg.business.name[primary]) {
      ctx.addIssue({
        code: 'custom',
        path: ['business', 'name', primary],
        message: `Business name is required in the default locale (${primary})`,
      });
    }
  });

export type ClientConfigInput = z.input<typeof ClientConfigSchema>;
export type ClientConfig = z.output<typeof ClientConfigSchema>;

/**
 * Validates a config object and returns the parsed result.
 * Throws with a readable list of problems when invalid.
 */
export function parseClientConfig(input: unknown): ClientConfig {
  const result = ClientConfigSchema.safeParse(input);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid client.config.ts:\n${lines.join('\n')}`);
  }
  return result.data;
}

/** Identity helper for type-checked authoring of `client.config.ts`. */
export function defineClientConfig(config: ClientConfigInput): ClientConfigInput {
  return config;
}

/** Picks the best string for a locale, falling back through the other locales. */
export function pickLocalized(value: Localized | undefined, locale: Locale): string {
  if (!value) return '';
  return value[locale] ?? value['zh-Hant'] ?? value.en ?? value['zh-Hans'] ?? '';
}
