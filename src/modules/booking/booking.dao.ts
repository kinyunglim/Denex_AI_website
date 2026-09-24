import { Filter, ObjectId, WithId } from 'mongodb';
import { getDb } from '@/src/lib/mongodb';
import { Appointment, Away, BLOCKING_STATUSES, BookingService, Staff } from './booking.model';

const oid = (id: string) => new ObjectId(id);

/**
 * Persistence for the four booking collections. No business rules here.
 */
export class BookingServiceDao {
  private static async col() {
    return (await getDb()).collection<BookingService>('booking_services');
  }
  static async findAll(activeOnly: boolean): Promise<WithId<BookingService>[]> {
    const filter: Filter<BookingService> = activeOnly ? { active: true } : {};
    return (await this.col()).find(filter).sort({ order: 1, createdAt: 1 }).toArray();
  }
  static async findById(id: string): Promise<WithId<BookingService> | null> {
    if (!ObjectId.isValid(id)) return null;
    return (await this.col()).findOne({ _id: oid(id) } as Filter<BookingService>);
  }
  static async insertOne(doc: BookingService): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }
  static async updateById(id: string, set: Partial<BookingService>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await this.col()).updateOne({ _id: oid(id) } as Filter<BookingService>, { $set: set })).matchedCount > 0;
  }
}

export class StaffDao {
  private static async col() {
    return (await getDb()).collection<Staff>('booking_staff');
  }
  static async findAll(activeOnly: boolean): Promise<WithId<Staff>[]> {
    const filter: Filter<Staff> = activeOnly ? { active: true } : {};
    return (await this.col()).find(filter).sort({ createdAt: 1 }).toArray();
  }
  static async findById(id: string): Promise<WithId<Staff> | null> {
    if (!ObjectId.isValid(id)) return null;
    return (await this.col()).findOne({ _id: oid(id) } as Filter<Staff>);
  }
  static async insertOne(doc: Staff): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }
  static async updateById(id: string, set: Partial<Staff>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await this.col()).updateOne({ _id: oid(id) } as Filter<Staff>, { $set: set })).matchedCount > 0;
  }
}

export class AwayDao {
  private static async col() {
    return (await getDb()).collection<Away>('booking_away');
  }
  static async findOverlapping(staffIds: ObjectId[], from: Date, to: Date): Promise<WithId<Away>[]> {
    return (await this.col())
      .find({ staffId: { $in: staffIds }, start: { $lt: to }, end: { $gt: from } } as Filter<Away>)
      .toArray();
  }
  static async findUpcoming(from: Date): Promise<WithId<Away>[]> {
    return (await this.col()).find({ end: { $gt: from } }).sort({ start: 1 }).toArray();
  }
  static async insertOne(doc: Away): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }
  static async deleteById(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await this.col()).deleteOne({ _id: oid(id) } as Filter<Away>)).deletedCount > 0;
  }
}

export class AppointmentDao {
  private static async col() {
    return (await getDb()).collection<Appointment>('booking_appointments');
  }
  static async ensureIndexes(): Promise<void> {
    const c = await this.col();
    await c.createIndex({ staffId: 1, start: 1 });
    await c.createIndex({ contactId: 1, start: -1 });
  }
  static async findById(id: string): Promise<WithId<Appointment> | null> {
    if (!ObjectId.isValid(id)) return null;
    return (await this.col()).findOne({ _id: oid(id) } as Filter<Appointment>);
  }
  /** Blocking appointments for these staff that overlap [from, to). */
  static async findBlocking(staffIds: ObjectId[], from: Date, to: Date): Promise<WithId<Appointment>[]> {
    return (await this.col())
      .find({
        staffId: { $in: staffIds },
        status: { $in: BLOCKING_STATUSES },
        start: { $lt: to },
        end: { $gt: from },
      } as Filter<Appointment>)
      .toArray();
  }
  static async findInRange(from: Date, to: Date): Promise<WithId<Appointment>[]> {
    return (await this.col()).find({ start: { $gte: from, $lt: to } }).sort({ start: 1 }).toArray();
  }
  static async findByContact(contactId: string): Promise<WithId<Appointment>[]> {
    if (!ObjectId.isValid(contactId)) return [];
    return (await this.col()).find({ contactId: oid(contactId) } as Filter<Appointment>).sort({ start: -1 }).toArray();
  }
  static async countFrom(from: Date): Promise<number> {
    return (await this.col()).countDocuments({ start: { $gte: from }, status: 'booked' });
  }
  static async insertOne(doc: Appointment): Promise<ObjectId> {
    return (await (await this.col()).insertOne(doc)).insertedId;
  }
  static async updateById(id: string, set: Partial<Appointment>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await (await this.col()).updateOne({ _id: oid(id) } as Filter<Appointment>, { $set: set })).matchedCount > 0;
  }
  static async deleteById(id: ObjectId): Promise<void> {
    await (await this.col()).deleteOne({ _id: id } as Filter<Appointment>);
  }
}
