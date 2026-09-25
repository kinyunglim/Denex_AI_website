import { setRequestLocale } from 'next-intl/server';
import { Locale } from '@/src/lib/config';
import { getBusiness, getContent } from '@/src/lib/site-context';
import { Contact } from '@/src/components/site/sections';
import { AgencyHome } from '@/src/components/agency/AgencyHome';
import { langOf } from '@/src/components/agency/home-copy';

/** Agency home: storefront sections (src/components/agency/AgencyHome.tsx), then the contact form. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [content, business] = await Promise.all([getContent(locale as Locale), getBusiness()]);

  return (
    <>
      <AgencyHome lang={langOf(locale)} cases={content.cases} />
      <Contact content={content.contact} whatsapp={business.whatsapp} />
    </>
  );
}
