import { Filter, ObjectId, WithId } from 'mongodb';
import { getDb } from '@/src/lib/mongodb';
import { Contact, ContactQuery, Note } from './crm.model';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Persistence for `crm_contacts`. No business rules here.
 */
export class ContactDao {
  private static readonly COLLECTION_NAME = 'crm_contacts';

  private static async getCollection() {
    const db = await getDb();
    return db.collection<Contact>(this.COLLECTION_NAME);
  }

  static async ensureIndexes(): Promise<void> {
    const c = await this.getCollection();
    await c.createIndex({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });
    await c.createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
    await c.createIndex({ createdAt: -1 });
  }

  static async findById(id: string): Promise<WithId<Contact> | null> {
    if (!ObjectId.isValid(id)) return null;
    const c = await this.getCollection();
    return c.findOne({ _id: new ObjectId(id) } as Filter<Contact>);
  }

  static async findByPhone(phone: string): Promise<WithId<Contact> | null> {
    const c = await this.getCollection();
    return c.findOne({ phone });
  }

  static async findByEmail(email: string): Promise<WithId<Contact> | null> {
    const c = await this.getCollection();
    return c.findOne({ email });
  }

  static buildFilter(query: ContactQuery): Filter<Contact> {
    const filter: Filter<Contact> = {};
    if (query.status) filter.status = query.status;
    if (query.tag) filter.tags = query.tag;
    if (query.search) {
      const rx = new RegExp(escapeRegex(query.search.trim()), 'i');
      filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
    }
    return filter;
  }

  static async findMany(query: ContactQuery, skip: number, limit: number): Promise<WithId<Contact>[]> {
    const c = await this.getCollection();
    return c.find(this.buildFilter(query)).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
  }

  static async findAll(): Promise<WithId<Contact>[]> {
    const c = await this.getCollection();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async count(query: ContactQuery = {}): Promise<number> {
    const c = await this.getCollection();
    return c.countDocuments(this.buildFilter(query));
  }

  static async insertOne(doc: Contact): Promise<ObjectId> {
    const c = await this.getCollection();
    const result = await c.insertOne(doc);
    return result.insertedId;
  }

  static async updateById(id: string, set: Partial<Contact>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const c = await this.getCollection();
    const result = await c.updateOne({ _id: new ObjectId(id) } as Filter<Contact>, { $set: set });
    return result.matchedCount > 0;
  }

  static async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const c = await this.getCollection();
    const result = await c.deleteOne({ _id: new ObjectId(id) } as Filter<Contact>);
    return result.deletedCount > 0;
  }
}

/**
 * Persistence for `crm_notes`.
 */
export class NoteDao {
  private static readonly COLLECTION_NAME = 'crm_notes';

  private static async getCollection() {
    const db = await getDb();
    return db.collection<Note>(this.COLLECTION_NAME);
  }

  static async findByContact(contactId: string): Promise<WithId<Note>[]> {
    if (!ObjectId.isValid(contactId)) return [];
    const c = await this.getCollection();
    return c.find({ contactId: new ObjectId(contactId) } as Filter<Note>).sort({ createdAt: -1 }).toArray();
  }

  static async insertOne(doc: Note): Promise<ObjectId> {
    const c = await this.getCollection();
    const result = await c.insertOne(doc);
    return result.insertedId;
  }

  static async deleteByContact(contactId: string): Promise<void> {
    if (!ObjectId.isValid(contactId)) return;
    const c = await this.getCollection();
    await c.deleteMany({ contactId: new ObjectId(contactId) } as Filter<Note>);
  }
}
