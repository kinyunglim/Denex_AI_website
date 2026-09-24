import { requireModulePage } from '@/src/lib/modules';
import { getAdminSession } from '@/src/lib/admin-session';
import { getAdminT, AdminT } from '@/src/lib/admin-i18n';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { ProductSummary } from '@/src/modules/catalog/catalog.model';
import { ActionForm } from '@/src/components/admin/ActionForm';
import { ActionButton } from '@/src/components/admin/ActionButton';
import { Field, PageHeader, Panel } from '@/src/components/admin/ui';
import { createProductAction, deleteProductAction, updateProductAction } from '../actions';

function ProductFields({ t, p }: { t: AdminT; p?: ProductSummary }) {
  return (
    <>
      <Field label={t('nameZhHant')}><input name="name_zhHant" defaultValue={p?.name['zh-Hant'] ?? ''} className="field" /></Field>
      <Field label={t('nameZhHans')}><input name="name_zhHans" defaultValue={p?.name['zh-Hans'] ?? ''} className="field" /></Field>
      <Field label={t('nameEn')}><input name="name_en" defaultValue={p?.name.en ?? ''} className="field" /></Field>
      <Field label={t('descZhHant')}><textarea name="desc_zhHant" rows={2} defaultValue={p?.description['zh-Hant'] ?? ''} className="field" /></Field>
      <Field label={t('descZhHans')}><textarea name="desc_zhHans" rows={2} defaultValue={p?.description['zh-Hans'] ?? ''} className="field" /></Field>
      <Field label={t('descEn')}><textarea name="desc_en" rows={2} defaultValue={p?.description.en ?? ''} className="field" /></Field>
      <Field label={t('category')}><input name="category" defaultValue={p?.category ?? ''} className="field" /></Field>
      <Field label={t('image')}><input name="image" type="url" defaultValue={p?.image ?? ''} className="field" /></Field>
      <Field label={t('order')}><input name="order" type="number" defaultValue={p?.order ?? 0} className="field" /></Field>
      <div className="sm:col-span-3">
        <Field label={t('specs')} hint={t('specsHint')}>
          <textarea name="specs" rows={4} defaultValue={(p?.specs ?? []).map((s) => `${s.label}: ${s.value}`).join('\n')} className="field font-mono text-xs" />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} /> {t('active')}</label>
    </>
  );
}

export default async function ProductsAdminPage() {
  requireModulePage('catalog');
  const t = await getAdminT();
  const session = await getAdminSession();
  const lang = getConfig().locales[0];
  const products = await CatalogService.listProducts(false);

  return (
    <div className="space-y-6">
      <PageHeader title={`${t('products')} (${products.length})`} />
      <Panel>
        <div className="space-y-3">
          {products.map((p) => (
            <details key={p.id} className="rounded-input border border-line p-3">
              <summary className="cursor-pointer text-sm font-semibold text-ink">
                {pickLocalized(p.name, lang)} {p.category && `· ${p.category}`} {p.active ? '' : `(${t('inactive')})`}
              </summary>
              <ActionForm action={updateProductAction.bind(null, p.id)} submitLabel={t('save')} className="mt-3 grid gap-3 sm:grid-cols-3">
                <ProductFields t={t} p={p} />
              </ActionForm>
              {session?.role === 'owner' && (
                <div className="mt-3"><ActionButton action={deleteProductAction.bind(null, p.id)} label={t('delete')} confirm={t('confirmDelete')} /></div>
              )}
            </details>
          ))}
          <details className="rounded-input border border-dashed border-line p-3" open={products.length === 0}>
            <summary className="cursor-pointer text-sm font-semibold text-primary">+ {t('add')}</summary>
            <ActionForm action={createProductAction} submitLabel={t('add')} resetOnSuccess className="mt-3 grid gap-3 sm:grid-cols-3">
              <ProductFields t={t} />
            </ActionForm>
          </details>
        </div>
      </Panel>
    </div>
  );
}
