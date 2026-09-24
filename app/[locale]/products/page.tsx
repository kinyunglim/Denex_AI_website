import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { requireModulePage } from '@/src/lib/modules';
import { isPreviewMode } from '@/src/lib/site';
import { getActiveTheme } from '@/src/lib/site-context';
import { Locale, pickLocalized } from '@/src/lib/config';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { PreviewService } from '@/src/modules/preview/preview.service';
import { Placeholder } from '@/src/components/site/Placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('catalog');
  return { title: t('title') };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  requireModulePage('catalog');
  const t = await getTranslations('catalog');
  const all = isPreviewMode() ? PreviewService.products(await getActiveTheme()) : await CatalogService.listProducts();
  const categories = [...new Set(all.map((p) => p.category).filter(Boolean))];
  const products = category ? all.filter((p) => p.category === category) : all;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl text-ink">{t('title')}</h1>
      <p className="mt-3 text-muted">{t('subtitle')}</p>
      {categories.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/products" className={`rounded-button border px-4 py-1.5 text-sm ${!category ? 'border-primary bg-primary text-on-primary' : 'border-line text-ink'}`}>
            {t('all')}
          </Link>
          {categories.map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className={`rounded-button border px-4 py-1.5 text-sm capitalize ${category === c ? 'border-primary bg-primary text-on-primary' : 'border-line text-ink'}`}>
              {c}
            </Link>
          ))}
        </div>
      )}
      {products.length === 0 ? (
        <p className="mt-10 text-muted">{t('empty')}</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Link key={p.id} href={`/products/${p.id}`} className="card overflow-hidden transition-transform hover:-translate-y-0.5">
              <div className="aspect-[4/3]">
                <Placeholder src={p.image} alt={pickLocalized(p.name, locale as Locale)} seed={i} />
              </div>
              <div className="p-5">
                <h2 className="text-lg text-ink">{pickLocalized(p.name, locale as Locale)}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{pickLocalized(p.description, locale as Locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
