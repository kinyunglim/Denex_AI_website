import { defineRouting } from 'next-intl/routing';
import clientConfig from '@/client.config';
import { LOCALES, Locale, parseClientConfig } from '@/src/lib/config';

/**
 * Locales come from client.config.ts (first = default). Preview sites show all three.
 * Every locale is prefixed (/zh-Hant, /en, …) so URLs are unambiguous.
 */
const configured = parseClientConfig(clientConfig).locales;
const locales: Locale[] = process.env.PREVIEW_MODE === '1' ? [...LOCALES] : configured;

export const routing = defineRouting({
  locales,
  defaultLocale: locales[0],
  localePrefix: 'always',
  // "/" always opens the client's chosen default language (HK browsers often report English).
  localeDetection: false,
});
