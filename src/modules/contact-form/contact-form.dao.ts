import { Filter, ObjectId, WithId } from 'mongodb';
import { getDb } from '@/src/lib/mongodb';
import { Submission } from './contact-form.model';

/**
 * Persistence for `form_submissions`.
 */
export class SubmissionDao {
  private static readonly COLLECTION_NAME = 'form_submissions';

  private static async getCollection() {
    const db = await getDb();
    return db.collection<Submission>(this.COLLECTION_NAME);
  }

  static async insertOne(doc: Submission): Promise<ObjectId> {
    const c = await this.getCollection();
    return (await c.insertOne(doc)).insertedId;
  }

  static async findRecent(limit: number, onlyUnhandled = false): Promise<WithId<Submission>[]> {
    const c = await this.getCollection();
    const filter: Filter<Submission> = onlyUnhandled ? { handled: false } : {};
    return c.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  }

  static async findByContact(contactId: string): Promise<WithId<Submission>[]> {
    if (!ObjectId.isValid(contactId)) return [];
    const c = await this.getCollection();
    return c.find({ contactId: new ObjectId(contactId) } as Filter<Submission>).sort({ createdAt: -1 }).toArray();
  }

  static async countUnhandled(): Promise<number> {
    const c = await this.getCollection();
    return c.countDocuments({ handled: false });
  }

  static async setHandled(id: string, handled: boolean): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const c = await this.getCollection();
    const r = await c.updateOne({ _id: new ObjectId(id) } as Filter<Submission>, { $set: { handled, updatedAt: new Date() } });
    return r.matchedCount > 0;
  }
}
