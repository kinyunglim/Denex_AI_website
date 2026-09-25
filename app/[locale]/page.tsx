import { setRequestLocale } from 'next-intl/server';
import { themes } from '@/themes';
import { Locale } from '@/src/lib/config';
import { getActiveTheme, getBusiness, getContent } from '@/src/lib/site-context';
import { Contact } from '@/src/components/site/sections';
import { AgencyHome } from '@/src/components/agency/AgencyHome';
import { langOf } from '@/src/components/agency/home-copy';

/** Agency home: storefront sections (src/components/agency/AgencyHome.tsx), then the contact form. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [content, business, themeName] = await Promise.all([getContent(locale as Locale), getBusiness(), getActiveTheme()]);

  return (
    <>
      <AgencyHome lang={langOf(locale)} theme={themes[themeName]} locale={locale} cases={content.cases} />
      <Contact content={content.contact} whatsapp={business.whatsapp} />
    </>
  );
}
