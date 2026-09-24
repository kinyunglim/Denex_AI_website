import 'server-only';
import { cookies } from 'next/headers';
import { ClientConfig, Locale, THEMES, ThemeName } from '@/src/lib/config';
import { SiteContent, SiteContentSchema } from '@/src/lib/content';
import { defaultPreviewTheme, getConfig, getDemoData, isPreviewMode } from '@/src/lib/site';
import contentZhHant from '@/content/zh-Hant.json';
import contentZhHans from '@/content/zh-Hans.json';
import contentEn from '@/content/en.json';

/**
 * Request-scoped view of "what this site is": theme, business details and copy.
 * In preview mode these come from the demo data of the theme the visitor picked
 * (cookie `preview_theme`, set by proxy.ts from `?theme=`).
 */
const CONTENT: Record<Locale, SiteContent> = {
  'zh-Hant': SiteContentSchema.parse(contentZhHant),
  'zh-Hans': SiteContentSchema.parse(contentZhHans),
  en: SiteContentSchema.parse(contentEn),
};

export async function getActiveTheme(): Promise<ThemeName> {
  if (!isPreviewMode()) return getConfig().theme;
  const store = await cookies();
  const picked = store.get('preview_theme')?.value;
  return (THEMES as readonly string[]).includes(picked ?? '') ? (picked as ThemeName) : defaultPreviewTheme();
}

export async function getBusiness(): Promise<ClientConfig['business']> {
  if (!isPreviewMode()) return getConfig().business;
  return getDemoData(await getActiveTheme()).business;
}

export async function getContent(locale: Locale): Promise<SiteContent> {
  if (!isPreviewMode()) return CONTENT[locale];
  return getDemoData(await getActiveTheme()).content[locale];
}
