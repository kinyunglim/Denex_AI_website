import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { requireModulePage } from '@/src/lib/modules';
import { isPreviewMode } from '@/src/lib/site';
import { getActiveTheme } from '@/src/lib/site-context';
import { Locale, pickLocalized } from '@/src/lib/config';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { ProductSummary } from '@/src/modules/catalog/catalog.model';
import { PreviewService } from '@/src/modules/preview/preview.service';
import { Placeholder } from '@/src/components/site/Placeholder';
import { InquiryForm } from '@/src/components/site/InquiryForm';

async function load(id: string): Promise<ProductSummary | null> {
  if (isPreviewMode()) return PreviewService.products(await getActiveTheme()).find((p) => p.id === id) ?? null;
  return CatalogService.getProduct(id).catch(() => null);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await load(id);
  return { title: product ? pickLocalized(product.name, locale as Locale) : undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  requireModulePage('catalog');
  const product = await load(id);
  if (!product) notFound();
  const t = await getTranslations('catalog');
  const name = pickLocalized(product.name, locale as Locale);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Link href="/products" className="text-sm text-muted hover:text-ink">← {t('back')}</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-card">
          <Placeholder src={product.image} alt={name} seed={product.order} />
        </div>
        <div>
          <h1 className="text-4xl text-ink">{name}</h1>
          <p className="mt-4 whitespace-pre-line text-muted">{pickLocalized(product.description, locale as Locale)}</p>
          {product.specs.length > 0 && (
            <>
              <h2 className="mt-8 text-lg text-ink">{t('specs')}</h2>
              <dl className="mt-3 divide-y divide-line rounded-card border border-line bg-surface">
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-3 gap-4 px-4 py-2.5 text-sm">
                    <dt className="text-muted">{s.label}</dt>
                    <dd className="col-span-2 text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
      <div className="card mt-12 max-w-2xl p-6">
        <h2 className="text-2xl text-ink">{t('inquire')}</h2>
        <div className="mt-5">
          <InquiryForm productId={product.id} />
        </div>
      </div>
    </section>
  );
}
