import { Filter, ObjectId, WithId } from 'mongodb';
import { getDb } from '@/src/lib/mongodb';
import { Inquiry, Product } from './catalog.model';

/**
 * Persistence for `catalog_products` and `catalog_inquiries`.
 */
export class ProductDao {
  private static async col() {
    return (await getDb()).collection<Product>('catalog_products');
  }
  static async findAll(activeOnly: boolean): Promise<WithId<Product>[]> {
    const filter: Filter<Product> = activeOnly ? { active: true } : {};
    return (await this.col()).find(filter).sort({ order: 1, createdAt: 1 }).toArray();
  }
  static async findById(id: string): Promise<WithId<Product> | null> {
    if (!ObjectId.isValid(id)) return null;
    return (await this.col()).findOne({ _id: new ObjectId(id) } as Filter<Product>);
  }
  static async insertOne(doc: Product): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }
  static async updateById(id: string, set: Partial<Product>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await this.col()).updateOne({ _id: new ObjectId(id) } as Filter<Product>, { $set: set })).matchedCount > 0;
  }
  static async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await this.col()).deleteOne({ _id: new ObjectId(id) } as Filter<Product>)).deletedCount > 0;
  }
}

export class InquiryDao {
  private static async col() {
    return (await getDb()).collection<Inquiry>('catalog_inquiries');
  }
  static async insertOne(doc: Inquiry): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }
  static async findRecent(limit: number): Promise<WithId<Inquiry>[]> {
    return (await this.col()).find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  }
  static async findByContact(contactId: string): Promise<WithId<Inquiry>[]> {
    if (!ObjectId.isValid(contactId)) return [];
    return (await this.col()).find({ contactId: new ObjectId(contactId) } as Filter<Inquiry>).sort({ createdAt: -1 }).toArray();
  }
  static async setHandled(id: string, handled: boolean): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await this.col()).updateOne({ _id: new ObjectId(id) } as Filter<Inquiry>, { $set: { handled, updatedAt: new Date() } })).matchedCount > 0;
  }
}
