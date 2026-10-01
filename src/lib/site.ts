import clientConfig from '@/client.config';
import { ClientConfig, parseClientConfig, THEMES, ThemeName } from '@/src/lib/config';
import demoCorporate from '@/demo/corporate.json';
import demoWarm from '@/demo/warm.json';
import demoProduct from '@/demo/product.json';
import demoBold from '@/demo/bold.json';
import demoClinic from '@/demo/clinic.json';
import demoBeauty from '@/demo/beauty.json';
import demoRestaurant from '@/demo/restaurant.json';
import demoEducation from '@/demo/education.json';
import demoInterior from '@/demo/interior.json';
import demoTech from '@/demo/tech.json';
import demoFlorist from '@/demo/florist.json';
import demoPets from '@/demo/pets.json';
import { DemoData, DemoDataSchema } from '@/src/lib/demo';

/**
 * Runtime access to the active client configuration.
 * Approach: parse `client.config.ts` once; in preview mode (PREVIEW_MODE=1)
 * swap in demo business data and turn every web module on, so one deployment
 * can showcase all four themes to prospects.
 */

const DEMO: Record<ThemeName, DemoData> = {
  corporate: DemoDataSchema.parse(demoCorporate),
  warm: DemoDataSchema.parse(demoWarm),
  product: DemoDataSchema.parse(demoProduct),
  bold: DemoDataSchema.parse(demoBold),
  clinic: DemoDataSchema.parse(demoClinic),
  beauty: DemoDataSchema.parse(demoBeauty),
  restaurant: DemoDataSchema.parse(demoRestaurant),
  education: DemoDataSchema.parse(demoEducation),
  interior: DemoDataSchema.parse(demoInterior),
  tech: DemoDataSchema.parse(demoTech),
  florist: DemoDataSchema.parse(demoFlorist),
  pets: DemoDataSchema.parse(demoPets),
};

let cached: ClientConfig | null = null;

export function isPreviewMode(): boolean {
  return process.env.PREVIEW_MODE === '1';
}

/**
 * Agency storefront showcase (SHOWCASE_MODE=1): the agency's own site and copy,
 * deployed without a database. Forms store nothing, ordering and booking are
 * closed, the back office is hidden. Used for a public demo before Atlas is set up.
 */
export function isShowcaseMode(): boolean {
  return process.env.SHOWCASE_MODE === '1';
}

/** Theme used in preview mode when the visitor hasn't picked one. */
export function defaultPreviewTheme(): ThemeName {
  const t = process.env.PREVIEW_THEME;
  return (THEMES as readonly string[]).includes(t ?? '') ? (t as ThemeName) : 'warm';
}

export function getDemoData(theme: ThemeName): DemoData {
  return DEMO[theme];
}

export function getConfig(): ClientConfig {
  if (cached) return cached;
  const base = parseClientConfig(clientConfig);
  if (!isPreviewMode()) {
    cached = base;
    return cached;
  }
  const theme = defaultPreviewTheme();
  const demo = DEMO[theme];
  cached = {
    ...base,
    theme,
    business: { ...base.business, ...demo.business },
    locales: ['zh-Hant', 'en', 'zh-Hans'],
    modules: { booking: true, payments: true, stripe: false, gcal: false, catalog: true, mobile: false },
    sections: ['hero', 'services', 'cases', 'about', 'contact'],
  };
  return cached;
}

/** Test helper: forget the cached config. */
export function resetConfigCache(): void {
  cached = null;
}
