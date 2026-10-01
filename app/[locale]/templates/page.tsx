import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { agency } from '@/agency.config';
import { copy, langOf } from '@/src/components/agency/home-copy';
import { TemplateGallery } from '@/src/components/agency/TemplateGallery';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agency');
  return { title: t('templatesTitle') };
}

/** All templates with category tabs; each card opens its preview page (/templates/[theme]). */
export default async function TemplatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agency');
  const lang = langOf(locale);
  const items = agency.themes.map((th) => ({ key: th.key, name: th.name[lang], fit: th.fit[lang], category: th.category }));
  const categories = agency.categories.map((c) => ({ key: c.key, name: c.name[lang] }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="section-title">{t('templatesTitle')}</h1>
      <p className="mt-3 max-w-2xl text-muted">{copy.preview.note[lang]}</p>
      <TemplateGallery
        items={items}
        categories={categories}
        labels={{ all: copy.gallery.all[lang], preview: copy.gallery.preview[lang], choose: copy.gallery.choose[lang] }}
      />
    </section>
  );
}
