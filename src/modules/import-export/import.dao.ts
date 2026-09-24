import { Filter, ObjectId, WithId } from 'mongodb';
import { getDb } from '@/src/lib/mongodb';
import { ImportJob } from './import.model';

/**
 * Persistence for `import_jobs`.
 */
export class ImportJobDao {
  private static readonly COLLECTION_NAME = 'import_jobs';

  private static async getCollection() {
    const db = await getDb();
    return db.collection<ImportJob>(this.COLLECTION_NAME);
  }

  static async insertOne(doc: ImportJob): Promise<ObjectId> {
    const c = await this.getCollection();
    return (await c.insertOne(doc)).insertedId;
  }

  static async findById(id: string): Promise<WithId<ImportJob> | null> {
    if (!ObjectId.isValid(id)) return null;
    const c = await this.getCollection();
    return c.findOne({ _id: new ObjectId(id) } as Filter<ImportJob>);
  }

  static async updateById(id: string, set: Partial<ImportJob>): Promise<void> {
    const c = await this.getCollection();
    await c.updateOne({ _id: new ObjectId(id) } as Filter<ImportJob>, { $set: set });
  }

  static async findRecent(limit: number): Promise<WithId<ImportJob>[]> {
    const c = await this.getCollection();
    return c.find({}, { projection: { rows: 0 } }).sort({ createdAt: -1 }).limit(limit).toArray();
  }
}
