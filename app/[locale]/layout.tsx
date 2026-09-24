import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import { themes } from '@/themes';
import { googleFontsHref, themeToCssVars } from '@/src/lib/theme';
import { Locale, pickLocalized } from '@/src/lib/config';
import { isPreviewMode } from '@/src/lib/site';
import { getActiveTheme, getBusiness, getContent } from '@/src/lib/site-context';
import { SiteHeader } from '@/src/components/site/SiteHeader';
import { SiteFooter } from '@/src/components/site/SiteFooter';
import { PreviewBar } from '@/src/components/site/PreviewBar';
import { WhatsAppButton } from '@/src/components/site/WhatsAppButton';
import { ServiceWorkerRegister } from '@/src/components/site/ServiceWorkerRegister';
import { FontLoader } from '@/src/components/site/FontLoader';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = (hasLocale(routing.locales, locale) ? locale : routing.defaultLocale) as Locale;
  const [business, content] = await Promise.all([getBusiness(), getContent(loc)]);
  const name = pickLocalized(business.name, loc);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: { default: `${name} — ${content.hero.title}`, template: `%s | ${name}` },
    description: content.hero.subtitle,
    manifest: '/manifest.webmanifest',
    icons: { icon: '/icon.svg', apple: '/icon.svg' },
    openGraph: { title: name, description: content.hero.subtitle },
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])) },
    robots: isPreviewMode() ? { index: false, follow: false } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const theme = themes[await getActiveTheme()];
  return { themeColor: theme.colors.primary };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const themeName = await getActiveTheme();
  const business = await getBusiness();
  const style = themeToCssVars(themes[themeName]) as CSSProperties;
  const fontsHref = googleFontsHref(themes[themeName]);

  return (
    <html lang={locale} style={style}>
      <body className="flex min-h-screen flex-col">
        <FontLoader href={fontsHref} />
        <NextIntlClientProvider>
          {isPreviewMode() && <PreviewBar current={themeName} />}
          <SiteHeader locale={locale as Locale} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={locale as Locale} />
          {business.whatsapp && <WhatsAppButton number={business.whatsapp} />}
          <ServiceWorkerRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
