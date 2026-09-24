import bcrypt from 'bcryptjs';
import { WithId } from 'mongodb';
import {
  AdminSummary,
  AdminUser,
  CreateAdminInput,
  CreateAdminSchema,
  UpdateAdminInput,
  UpdateAdminSchema,
} from '@/src/models/admin-user';
import { AdminDao } from '@/src/dao/admin.dao';
import { parseInput } from '@/src/lib/api';
import { ConflictError, NotFoundError, ValidationError } from '@/src/lib/errors';

/**
 * Admin account management (owner-only in the UI).
 */
export class AdminService {
  static toSummary(doc: WithId<AdminUser>): AdminSummary {
    return {
      id: doc._id.toHexString(),
      email: doc.email,
      name: doc.name,
      role: doc.role ?? 'staff',
      isActive: doc.isActive,
      lastLogin: doc.lastLogin ? doc.lastLogin.toISOString() : null,
    };
  }

  static async list(): Promise<AdminSummary[]> {
    const admins = await AdminDao.findMany({}, 0, 200, { createdAt: 1 });
    return admins.map((a) => this.toSummary(a));
  }

  static async create(input: CreateAdminInput): Promise<AdminSummary> {
    const data = parseInput(CreateAdminSchema, input);
    const email = data.email.trim().toLowerCase();
    if (await AdminDao.findByEmail(email)) {
      throw new ConflictError('An admin with this email already exists');
    }
    const now = new Date();
    const doc: AdminUser = {
      email,
      name: data.name,
      role: data.role,
      password: await bcrypt.hash(data.password, 10),
      permissions: ['all'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const result = await AdminDao.insertOne(doc);
    return this.toSummary({ ...doc, _id: result.insertedId });
  }

  static async update(id: string, input: UpdateAdminInput, actorId: string): Promise<void> {
    const data = parseInput(UpdateAdminSchema, input);
    const existing = await AdminDao.findById(id);
    if (!existing) throw new NotFoundError('Admin not found');
    if (id === actorId && (data.role === 'staff' || data.isActive === false)) {
      throw new ValidationError('You cannot demote or deactivate yourself');
    }
    const set: Partial<AdminUser> = { updatedAt: new Date() };
    if (data.name !== undefined) set.name = data.name;
    if (data.role !== undefined) set.role = data.role;
    if (data.isActive !== undefined) set.isActive = data.isActive;
    if (data.password) set.password = await bcrypt.hash(data.password, 10);
    await AdminDao.updateById(id, { $set: set });
  }

  static async remove(id: string, actorId: string): Promise<void> {
    if (id === actorId) throw new ValidationError('You cannot delete yourself');
    const deleted = await AdminDao.deleteById(id);
    if (!deleted) throw new NotFoundError('Admin not found');
  }
}
