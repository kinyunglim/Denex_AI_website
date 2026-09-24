import { ObjectId, WithId } from 'mongodb';
import { parseInput } from '@/src/lib/api';
import { NotFoundError } from '@/src/lib/errors';
import { getConfig, isPreviewMode } from '@/src/lib/site';
import { requireModule } from '@/src/lib/modules';
import { pickLocalized, Locale } from '@/src/lib/config';
import { Mailer } from '@/src/lib/email';
import { CrmService } from '@/src/modules/crm/crm.service';
import { InquiryDao, ProductDao } from './catalog.dao';
import { Inquiry, InquiryInput, InquiryInputSchema, InquirySummary, Product, ProductInput, ProductInputSchema, ProductSummary } from './catalog.model';

const toProduct = (d: WithId<Product>): ProductSummary => ({
  id: d._id.toHexString(),
  name: d.name,
  description: d.description,
  category: d.category,
  image: d.image,
  specs: d.specs,
  active: d.active,
  order: d.order,
});

const toInquiry = (d: WithId<Inquiry>): InquirySummary => ({
  id: d._id.toHexString(),
  productId: d.productId ? d.productId.toHexString() : null,
  productName: d.productName,
  contactId: d.contactId.toHexString(),
  quantity: d.quantity,
  message: d.message,
  handled: d.handled,
  createdAt: d.createdAt.toISOString(),
});

/**
 * Product catalogue and B2B enquiries (enquiries become CRM contacts).
 */
export class CatalogService {
  static async listProducts(activeOnly = true): Promise<ProductSummary[]> {
    return (await ProductDao.findAll(activeOnly)).map(toProduct);
  }

  static async getProduct(id: string, activeOnly = true): Promise<ProductSummary> {
    const doc = await ProductDao.findById(id);
    if (!doc || (activeOnly && !doc.active)) throw new NotFoundError('Product not found');
    return toProduct(doc);
  }

  static async createProduct(input: ProductInput, by: string): Promise<ProductSummary> {
    const data = parseInput(ProductInputSchema, input);
    const now = new Date();
    const doc: Product = { ...data, createdAt: now, updatedAt: now, createdBy: by };
    const id = await ProductDao.insertOne(doc);
    return toProduct({ ...doc, _id: id });
  }

  static async updateProduct(id: string, input: ProductInput): Promise<void> {
    const data = parseInput(ProductInputSchema, input);
    if (!(await ProductDao.updateById(id, { ...data, updatedAt: new Date() }))) throw new NotFoundError('Product not found');
  }

  static async deleteProduct(id: string): Promise<void> {
    if (!(await ProductDao.deleteById(id))) throw new NotFoundError('Product not found');
  }

  static async submitInquiry(input: InquiryInput): Promise<{ accepted: true }> {
    requireModule('catalog');
    const data = parseInput(InquiryInputSchema, input);
    if (data.website || isPreviewMode()) return { accepted: true };

    const product = data.productId ? await ProductDao.findById(data.productId) : null;
    const productName = product ? pickLocalized(product.name, data.locale as Locale) : '';
    const { contact } = await CrmService.findOrCreateContact({
      name: data.company ? `${data.name} (${data.company})` : data.name,
      phone: data.phone,
      email: data.email,
      locale: data.locale,
      tags: ['inquiry'],
      source: 'catalog',
    });
    const now = new Date();
    await InquiryDao.insertOne({
      productId: product?._id ?? null,
      productName,
      contactId: new ObjectId(contact.id),
      quantity: data.quantity,
      message: data.message,
      handled: false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });

    const cfg = getConfig();
    try {
      await Mailer.send({
        to: cfg.notify.email,
        replyTo: contact.email ?? undefined,
        subject: `[${pickLocalized(cfg.business.name, cfg.locales[0])}] 產品查詢 Product enquiry — ${productName || data.name}`,
        text: `${data.name} ${data.company}\n${contact.phone ?? ''} ${contact.email ?? ''}\nProduct: ${productName || '-'}\nQuantity: ${data.quantity || '-'}\n\n${data.message}`,
      });
    } catch (error) {
      console.error('[Catalog] Notification failed:', error);
    }
    return { accepted: true };
  }

  static async listInquiries(limit = 50): Promise<InquirySummary[]> {
    return (await InquiryDao.findRecent(limit)).map(toInquiry);
  }

  static async listInquiriesForContact(contactId: string): Promise<InquirySummary[]> {
    return (await InquiryDao.findByContact(contactId)).map(toInquiry);
  }

  static async setInquiryHandled(id: string, handled: boolean): Promise<void> {
    if (!(await InquiryDao.setHandled(id, handled))) throw new NotFoundError('Inquiry not found');
  }
}
