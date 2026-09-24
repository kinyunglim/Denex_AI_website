import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { setupTestDb } from '@/src/test/mongo';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { CrmService } from '@/src/modules/crm/crm.service';
import { Mailer } from '@/src/lib/email';
import { resetConfigCache } from '@/src/lib/site';
import clientConfig from '@/client.config';

setupTestDb();

describe('CatalogService', () => {
  const cfg = clientConfig as { modules: Record<string, boolean> };
  const original = { ...cfg.modules };

  beforeEach(() => {
    cfg.modules.catalog = true;
    resetConfigCache();
    jest.spyOn(Mailer, 'send').mockResolvedValue(undefined);
  });

  afterEach(() => {
    cfg.modules = { ...original };
    resetConfigCache();
    jest.restoreAllMocks();
  });

  it('creates, lists, hides and deletes products', async () => {
    const p = await CatalogService.createProduct(
      { name: { en: 'Shrimp' }, specs: [{ label: 'Size', value: '21/25' }], category: 'frozen' },
      'admin'
    );
    await CatalogService.createProduct({ name: { en: 'Crab' }, order: -1 }, 'admin');
    expect((await CatalogService.listProducts()).map((x) => x.name.en)).toEqual(['Crab', 'Shrimp']);
    await CatalogService.updateProduct(p.id, { name: { en: 'Shrimp' }, active: false });
    expect(await CatalogService.listProducts()).toHaveLength(1);
    await expect(CatalogService.getProduct(p.id)).rejects.toThrow('not found');
    await CatalogService.deleteProduct(p.id);
    expect(await CatalogService.listProducts(false)).toHaveLength(1);
  });

  it('turns an inquiry into a tagged CRM contact and notifies', async () => {
    const p = await CatalogService.createProduct({ name: { en: 'Shrimp', 'zh-Hant': '蝦' } }, 'admin');
    await CatalogService.submitInquiry({ productId: p.id, name: 'Raj', company: 'Imports Ltd', email: 'raj@x.com', quantity: '1 x 40ft', locale: 'en' });
    const [inq] = await CatalogService.listInquiries();
    expect(inq.productName).toBe('Shrimp');
    const [contact] = await CrmService.allContacts();
    expect(contact.name).toBe('Raj (Imports Ltd)');
    expect(contact.tags).toEqual(['inquiry']);
    expect(Mailer.send).toHaveBeenCalled();
  });

  it('refuses inquiries when the module is off', async () => {
    cfg.modules.catalog = false;
    resetConfigCache();
    await expect(CatalogService.submitInquiry({ name: 'A', email: 'a@x.com' })).rejects.toThrow('not enabled');
  });
});
