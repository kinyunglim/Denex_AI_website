import { setRequestLocale } from 'next-intl/server';
import { themes } from '@/themes';
import { Locale } from '@/src/lib/config';
import { getConfig } from '@/src/lib/site';
import { getActiveTheme, getBusiness, getContent } from '@/src/lib/site-context';
import { About, Cases, Contact, Hero, Services } from '@/src/components/site/sections';

/** Home: the sections listed in client.config.ts, in that order. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cfg = getConfig();
  const [content, business, themeName] = await Promise.all([getContent(locale as Locale), getBusiness(), getActiveTheme()]);
  const theme = themes[themeName];
  const ctaHref = cfg.modules.booking ? '/book' : '/#contact';

  return (
    <>
      {cfg.sections.map((section) => {
        switch (section) {
          case 'hero':
            return <Hero key={section} content={content.hero} theme={theme} ctaHref={ctaHref} />;
          case 'services':
            return <Services key={section} content={content.services} />;
          case 'cases':
            return <Cases key={section} content={content.cases} />;
          case 'about':
            return <About key={section} content={content.about} />;
          case 'contact':
            return <Contact key={section} content={content.contact} whatsapp={business.whatsapp} />;
        }
      })}
    </>
  );
}
