import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * AdminUser Zod Schema
 * Approach: back-office staff accounts in `admin_users`. `role` gates access:
 * owners see everything; staff cannot see payments, exports or admin users.
 */
export const ADMIN_ROLES = ['owner', 'staff'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const AdminUserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  email: z.string().email({ message: 'Invalid admin email address' }),
  password: z.string().min(10, { message: 'Admin password must be at least 10 characters long' }),
  name: z.string().min(2),
  role: z.enum(ADMIN_ROLES).default('staff'),
  permissions: z.array(z.string()).default(['all']),
  isActive: z.boolean().default(true),
  otp: z
    .object({
      code: z.string().optional(),
      expiresAt: z.date().optional(),
    })
    .optional(),
  lastLogin: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

/** Admin login payload. Allows the "admin" username for the dev-only default admin. */
export const AdminLoginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const CreateAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(10, { message: 'Password must be at least 10 characters' }),
  role: z.enum(ADMIN_ROLES),
});
export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;

export const UpdateAdminSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(ADMIN_ROLES).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(10).optional(),
});
export type UpdateAdminInput = z.infer<typeof UpdateAdminSchema>;

/** API-safe admin shape (no password / OTP). */
export type AdminSummary = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin: string | null;
};
