import { ObjectId, WithId } from 'mongodb';
import { parseInput } from '@/src/lib/api';
import { ConflictError, NotFoundError, ValidationError } from '@/src/lib/errors';
import { normalizeEmail, normalizePhone } from '@/src/lib/phone';
import { ContactDao, NoteDao } from './crm.dao';
import {
  Contact,
  ContactInput,
  ContactInputSchema,
  ContactQuery,
  ContactSource,
  ContactSummary,
  ContactUpdate,
  ContactUpdateSchema,
  Note,
  NoteInputSchema,
  NoteSummary,
} from './crm.model';

export type FindOrCreateInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  locale?: string | null;
  tags?: string[];
  source: ContactSource;
  createdBy?: string;
};

export type ContactPage = { items: ContactSummary[]; total: number; page: number; pages: number };

/**
 * CRM business logic, and the only entry point other modules use to
 * create/link contacts (form, booking, catalog, import).
 */
export class CrmService {
  static toSummary(doc: WithId<Contact>): ContactSummary {
    return {
      id: doc._id.toHexString(),
      name: doc.name,
      phone: doc.phone,
      email: doc.email,
      whatsapp: doc.whatsapp,
      tags: doc.tags,
      source: doc.source,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  /** Finds an existing contact by phone, then email. */
  static async match(phone: string | null, email: string | null): Promise<WithId<Contact> | null> {
    if (phone) {
      const byPhone = await ContactDao.findByPhone(phone);
      if (byPhone) return byPhone;
    }
    if (email) return ContactDao.findByEmail(email);
    return null;
  }

  /**
   * Returns the matching contact (filling in any missing phone/email/tags) or
   * creates a new one. Match order: normalised phone, then lower-cased email.
   */
  static async findOrCreateContact(input: FindOrCreateInput): Promise<{ contact: ContactSummary; created: boolean }> {
    const phone = normalizePhone(input.phone);
    const email = normalizeEmail(input.email);
    if (!phone && !email) throw new ValidationError('Phone or email is required');

    const existing = await this.match(phone, email);
    const now = new Date();
    if (existing) {
      const set: Partial<Contact> = {};
      if (!existing.phone && phone) set.phone = phone;
      if (!existing.email && email) set.email = email;
      if (!existing.whatsapp && input.whatsapp) set.whatsapp = normalizePhone(input.whatsapp);
      const newTags = (input.tags ?? []).filter((t) => !existing.tags.includes(t));
      if (newTags.length) set.tags = [...existing.tags, ...newTags];
      if (Object.keys(set).length) {
        set.updatedAt = now;
        await ContactDao.updateById(existing._id.toHexString(), set);
      }
      return { contact: this.toSummary({ ...existing, ...set }), created: false };
    }

    const doc: Contact = {
      name: input.name.trim() || phone || email || 'Unknown',
      phone,
      email,
      whatsapp: normalizePhone(input.whatsapp),
      tags: input.tags ?? [],
      source: input.source,
      status: 'lead',
      locale: input.locale ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy ?? 'system',
    };
    const id = await ContactDao.insertOne(doc);
    return { contact: this.toSummary({ ...doc, _id: id }), created: true };
  }

  /** Manual create from the admin: refuses duplicates instead of merging. */
  static async createContact(input: ContactInput, createdBy: string): Promise<ContactSummary> {
    const data = parseInput(ContactInputSchema, input);
    const phone = normalizePhone(data.phone);
    const email = normalizeEmail(data.email);
    const dup = await this.match(phone, email);
    if (dup) throw new ConflictError(`A contact with this phone or email already exists (${dup.name})`);
    const now = new Date();
    const doc: Contact = {
      name: data.name,
      phone,
      email,
      whatsapp: normalizePhone(data.whatsapp),
      tags: data.tags,
      source: 'manual',
      status: data.status,
      locale: data.locale ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy,
    };
    const id = await ContactDao.insertOne(doc);
    return this.toSummary({ ...doc, _id: id });
  }

  static async updateContact(id: string, input: ContactUpdate): Promise<ContactSummary> {
    const data = parseInput(ContactUpdateSchema, input);
    const existing = await ContactDao.findById(id);
    if (!existing) throw new NotFoundError('Contact not found');

    const set: Partial<Contact> = { updatedAt: new Date() };
    if (data.name !== undefined) set.name = data.name;
    if (data.status !== undefined) set.status = data.status;
    if (data.tags !== undefined) set.tags = data.tags;
    if (data.whatsapp !== undefined) set.whatsapp = normalizePhone(data.whatsapp);
    if (data.phone !== undefined) set.phone = normalizePhone(data.phone);
    if (data.email !== undefined) set.email = normalizeEmail(data.email);

    for (const [field, value] of [['phone', set.phone], ['email', set.email]] as const) {
      if (!value) continue;
      const other = field === 'phone' ? await ContactDao.findByPhone(value) : await ContactDao.findByEmail(value);
      if (other && !other._id.equals(existing._id)) {
        throw new ConflictError(`Another contact already uses this ${field} (${other.name})`);
      }
    }
    const nextPhone = set.phone !== undefined ? set.phone : existing.phone;
    const nextEmail = set.email !== undefined ? set.email : existing.email;
    if (!nextPhone && !nextEmail) throw new ValidationError('Phone or email is required');

    await ContactDao.updateById(id, set);
    return this.toSummary({ ...existing, ...set });
  }

  static async deleteContact(id: string): Promise<void> {
    const deleted = await ContactDao.deleteById(id);
    if (!deleted) throw new NotFoundError('Contact not found');
    await NoteDao.deleteByContact(id);
  }

  static async getContact(id: string): Promise<ContactSummary> {
    const doc = await ContactDao.findById(id);
    if (!doc) throw new NotFoundError('Contact not found');
    return this.toSummary(doc);
  }

  static async listContacts(query: ContactQuery): Promise<ContactPage> {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100);
    const page = Math.max(query.page ?? 1, 1);
    const [docs, total] = await Promise.all([
      ContactDao.findMany(query, (page - 1) * limit, limit),
      ContactDao.count(query),
    ]);
    return { items: docs.map((d) => this.toSummary(d)), total, page, pages: Math.max(Math.ceil(total / limit), 1) };
  }

  static async allContacts(): Promise<ContactSummary[]> {
    return (await ContactDao.findAll()).map((d) => this.toSummary(d));
  }

  static async countContacts(): Promise<number> {
    return ContactDao.count();
  }

  static async addNote(contactId: string, input: { body: string }, author: string): Promise<NoteSummary> {
    const { body } = parseInput(NoteInputSchema, input);
    if (!(await ContactDao.findById(contactId))) throw new NotFoundError('Contact not found');
    const now = new Date();
    const doc: Note = {
      contactId: new ObjectId(contactId),
      body,
      author,
      createdAt: now,
      updatedAt: now,
      createdBy: author,
    };
    const id = await NoteDao.insertOne(doc);
    return { id: id.toHexString(), body, author, createdAt: now.toISOString() };
  }

  static async listNotes(contactId: string): Promise<NoteSummary[]> {
    const notes = await NoteDao.findByContact(contactId);
    return notes.map((n) => ({ id: n._id.toHexString(), body: n.body, author: n.author, createdAt: n.createdAt.toISOString() }));
  }
}
