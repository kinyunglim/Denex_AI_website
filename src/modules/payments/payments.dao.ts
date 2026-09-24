import { Filter, ObjectId, WithId } from 'mongodb';
import { getDb } from '@/src/lib/mongodb';
import { PaymentRecord } from './payments.model';

type Counter = { _id: string; seq: number };

/**
 * Persistence for `pay_records` and the receipt counter.
 */
export class PaymentDao {
  private static async col() {
    return (await getDb()).collection<PaymentRecord>('pay_records');
  }

  static async insertOne(doc: PaymentRecord): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }

  static async findById(id: string): Promise<WithId<PaymentRecord> | null> {
    if (!ObjectId.isValid(id)) return null;
    return (await this.col()).findOne({ _id: new ObjectId(id) } as Filter<PaymentRecord>);
  }

  static async findInRange(from: Date, to: Date): Promise<WithId<PaymentRecord>[]> {
    return (await this.col()).find({ paidAt: { $gte: from, $lt: to } }).sort({ paidAt: -1 }).toArray();
  }

  static async findByContact(contactId: string): Promise<WithId<PaymentRecord>[]> {
    if (!ObjectId.isValid(contactId)) return [];
    return (await this.col()).find({ contactId: new ObjectId(contactId) } as Filter<PaymentRecord>).sort({ paidAt: -1 }).toArray();
  }

  static async sumInRange(from: Date, to: Date): Promise<number> {
    const [row] = await (await this.col())
      .aggregate<{ total: number }>([
        { $match: { paidAt: { $gte: from, $lt: to } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray();
    return row?.total ?? 0;
  }

  /** Atomically returns the next number in a named sequence. */
  static async nextSeq(name: string): Promise<number> {
    const counters = (await getDb()).collection<Counter>('pay_counters');
    const doc = await counters.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    return doc?.seq ?? 1;
  }
}
