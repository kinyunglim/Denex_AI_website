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
import { AgencyHeader } from '@/src/components/agency/AgencyHeader';
import { AgencyFooter } from '@/src/components/agency/AgencyFooter';
import { BackToTop } from '@/src/components/agency/AgencyNav';
import { copy, langOf } from '@/src/components/agency/home-copy';
import { ChatWidget } from '@/src/components/agency/ChatWidget';
import { PreviewBar } from '@/src/components/site/PreviewBar';
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
    icons: { icon: '/denex-logo.png', apple: '/denex-logo.png' },
    openGraph: { title: name, description: content.hero.subtitle },
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])) },
    robots: isPreviewMode() ? { index: false, follow: false } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const theme = themes[await getActiveTheme()];
  return { themeColor: theme.colors.primary };
}

/** Chat widget strings for one language (keeps the full copy file out of the client bundle). */
function chatLabels(lang: 'zh-Hant' | 'en') {
  const c = copy.chat;
  return {
    open: c.open[lang], title: c.title[lang], status: c.status[lang], greeting: c.greeting[lang],
    suggestions: c.suggestions.map((s) => s[lang]), placeholder: c.placeholder[lang], send: c.send[lang],
    close: c.close[lang], reset: c.reset[lang], disclaimer: c.disclaimer[lang], unavailable: c.unavailable[lang],
    busy: c.busy[lang], error: c.error[lang], order: c.order[lang], contact: c.contact[lang],
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const themeName = await getActiveTheme();
  const style = themeToCssVars(themes[themeName]) as CSSProperties;
  const fontsHref = googleFontsHref(themes[themeName]);

  return (
    <html lang={locale} style={style}>
      <body className="flex min-h-screen flex-col">
        <FontLoader href={fontsHref} />
        <NextIntlClientProvider>
          {isPreviewMode() && <PreviewBar current={themeName} />}
          <AgencyHeader locale={locale as Locale} />
          <main className="flex-1">{children}</main>
          <AgencyFooter locale={locale as Locale} />
          <BackToTop label={copy.footer.top[langOf(locale)]} />
          {/* WhatsApp lives in the top bar; this corner belongs to the AI assistant. */}
          <ChatWidget locale={locale} labels={chatLabels(langOf(locale))} />
          <ServiceWorkerRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
