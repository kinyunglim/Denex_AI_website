import { User } from '@/src/models/user';
import type { UserPicklistRow } from '@/src/models/user-picklist';
import { UserDao } from '@/src/dao/user.dao';
import bcrypt from 'bcryptjs';

/** Re-export picklist shape for callers that import service only. */
export type { UserPicklistRow };

/** Max rows loaded for admin dropdowns (most recent accounts). */
export const USER_PICKLIST_HARD_CAP = 500;

/**
 * Service for handling user-related operations.
 * This service provides methods for managing users, including retrieval, creation, and updates.
 */
export class UserService {
  /**
   * Recent app users (`createdAt` desc) mapped to `_id`, `email`, and `name` only.
   *
   * @param limit Requested rows; capped at {@link USER_PICKLIST_HARD_CAP}.
   */
  static async listUsersForPicklist(
    limit: number = USER_PICKLIST_HARD_CAP
  ): Promise<UserPicklistRow[]> {
    const l = Number.isFinite(limit)
      ? Math.min(Math.max(1, Math.floor(limit)), USER_PICKLIST_HARD_CAP)
      : USER_PICKLIST_HARD_CAP;

    const rows = await UserDao.findMany({}, 0, l);
    return rows.map((doc) => ({
      userId: doc._id.toString(),
      email: doc.email,
      name: doc.name ?? null,
    }));
  }

  /**
   * Display label for admin lists: trimmed profile name when present, otherwise email.
   */
  static formatOwnerDisplayName(row: Pick<UserPicklistRow, 'name' | 'email'>): string {
    const trimmed =
      typeof row.name === 'string' ? row.name.trim() : '';
    if (trimmed.length > 0) return trimmed;
    return row.email;
  }

  /**
   * Batch-load picklist rows by Mongo `_id` strings (deduped in DAO).
   */
  static async getPicklistRowsByIds(ids: string[]): Promise<UserPicklistRow[]> {
    const docs = await UserDao.findPicklistFieldsByIds(ids);
    return docs.map((doc) => ({
      userId: doc._id.toString(),
      email: doc.email,
      name: doc.name ?? null,
    }));
  }

  /**
   * Retrieves a paginated list of users from the database.
   * 
   * @param {number} page - The page number to retrieve (starts from 1).
   * @param {number} limit - The number of users to retrieve per page.
   * @returns {Promise<{ users: User[]; total: number; pages: number }>} A promise that resolves to an object containing the users, total count, and total pages.
   */
  static async getUsers(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; pages: number }> {
    // Calculate number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch users and total count in parallel using DAO
    const [users, total] = await Promise.all([
      UserDao.findMany({}, skip, limit),
      UserDao.count({})
    ]);

    // Calculate total pages
    const pages = Math.ceil(total / limit);

    console.log(`[UserService] Fetched ${users.length} users (Page ${page}/${pages}, Total: ${total})`);

    return {
      users: users as User[],
      total,
      pages
    };
  }

  /**
   * Creates a new user in the database.
   * 
   * @param {Partial<User> & { password?: string }} userData - The user data to create.
   * @returns {Promise<string>} A promise that resolves to the created user's ID.
   * @throws {Error} If the user already exists or creation fails.
   */
  static async createUser(userData: Partial<User> & { password?: string }): Promise<string> {
    // Check if user already exists using DAO
    const existingUser = await UserDao.findByEmail(userData.email!);
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    const passwordPlain = userData.password || Math.random().toString(36).slice(-10);

    const newUser = {
      ...userData,
      role: userData.role || 'user',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      isVerified: userData.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: await bcrypt.hash(passwordPlain, 10),
    } as User;

    const result = await UserDao.insertOne(newUser);

    
    console.log(`[UserService] Created new user with email: ${userData.email}, ID: ${result.insertedId}`);
    return result.insertedId.toString();
  }

  /**
   * Updates an existing user's information.
   * 
   * @param {string} userId - The ID of the user to update.
   * @param {Partial<User>} data - The data to update.
   * @returns {Promise<boolean>} A promise that resolves to true if the update was successful.
   */
  static async updateUser(userId: string, data: Partial<User>): Promise<boolean> {
    const updateData = { 
      ...data,
      updatedAt: new Date()
    };

    // Update user using DAO
    const success = await UserDao.updateById(userId, { $set: updateData });

    console.log(`[UserService] Updated user ${userId}:`, success);
    return success;
  }

  /**
   * Deletes a user from the database.
   * 
   * @param {string} userId - The ID of the user to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful.
   */
  static async deleteUser(userId: string): Promise<boolean> {
    // Delete user using DAO
    const success = await UserDao.deleteById(userId);

    console.log(`[UserService] Deleted user ${userId}:`, success);
    return success;
  }
}

