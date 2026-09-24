import { Filter, ObjectId, UpdateFilter, WithId } from 'mongodb';
import { getDb } from '@/src/lib/mongodb';
import { Order, OrderStatus } from './orders.model';

type Counter = { _id: string; seq: number };

/**
 * Persistence for `agency_orders`. Status changes are compare-and-set
 * (`from` → `to`) so two clicks or two workers can never both win.
 */
export class OrderDao {
  private static async col() {
    return (await getDb()).collection<Order>('agency_orders');
  }

  static async nextRef(year: number): Promise<string> {
    const counters = (await getDb()).collection<Counter>('agency_counters');
    const doc = await counters.findOneAndUpdate({ _id: `order-${year}` }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
    return `ORD-${year}-${String(doc?.seq ?? 1).padStart(4, '0')}`;
  }

  static async insertOne(doc: Order): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }

  static async findById(id: string): Promise<WithId<Order> | null> {
    if (!ObjectId.isValid(id)) return null;
    return (await this.col()).findOne({ _id: new ObjectId(id) } as Filter<Order>);
  }

  static async findByRef(ref: string): Promise<WithId<Order> | null> {
    return (await this.col()).findOne({ ref });
  }

  static async findBySession(sessionId: string): Promise<WithId<Order> | null> {
    return (await this.col()).findOne({ 'stripe.sessionId': sessionId });
  }

  static async list(statuses?: OrderStatus[], limit = 200): Promise<WithId<Order>[]> {
    const filter: Filter<Order> = statuses?.length ? { status: { $in: statuses } } : {};
    return (await this.col()).find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  }

  static async countByStatus(statuses: OrderStatus[]): Promise<number> {
    return (await this.col()).countDocuments({ status: { $in: statuses } });
  }

  static async update(id: ObjectId, update: UpdateFilter<Order>): Promise<void> {
    await (await this.col()).updateOne({ _id: id } as Filter<Order>, update);
  }

  /** Atomically moves an order from one of `from` to `to`; returns the updated doc or null. */
  static async transition(
    id: ObjectId,
    from: OrderStatus[],
    to: OrderStatus,
    by: string,
    extra: Partial<Order> = {},
    note?: string
  ): Promise<WithId<Order> | null> {
    const now = new Date();
    return (await this.col()).findOneAndUpdate(
      { _id: id, status: { $in: from } } as Filter<Order>,
      {
        $set: { ...extra, status: to, updatedAt: now },
        $push: { history: { at: now, status: to, by, ...(note ? { note } : {}) } },
      },
      { returnDocument: 'after' }
    );
  }

  /** Worker claim: oldest approved order → in_production. */
  static async claimNextApproved(worker: string): Promise<WithId<Order> | null> {
    const now = new Date();
    return (await this.col()).findOneAndUpdate(
      { status: 'approved' },
      {
        $set: { status: 'in_production', updatedAt: now, 'production.startedAt': now, 'production.error': null, 'production.log': '' },
        $push: { history: { at: now, status: 'in_production', by: worker } },
      },
      { sort: { updatedAt: 1 }, returnDocument: 'after' }
    );
  }
}
