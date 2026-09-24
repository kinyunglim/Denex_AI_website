import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminRole, ADMIN_ROLES } from '@/src/models/admin-user';
import { ForbiddenError, UnauthorizedError } from '@/src/lib/errors';

/**
 * Admin sessions live in an httpOnly cookie (not localStorage), so server
 * components, server actions and API routes can all check them.
 */
export const ADMIN_COOKIE = 'admin_session';
const EXPIRES_IN_SECONDS = 12 * 60 * 60;

export type AdminSession = {
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
};

function secret(): string {
  const s = process.env.JWT_ADMIN_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_ADMIN_SECRET must be set in production');
  }
  return 'dev-only-admin-secret';
}

export function signAdminToken(session: AdminSession): string {
  return jwt.sign({ ...session, type: 'admin' }, secret(), { expiresIn: EXPIRES_IN_SECONDS });
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    const decoded = jwt.verify(token, secret());
    if (typeof decoded === 'string') return null;
    const p = decoded as JwtPayload;
    if (p.type !== 'admin') return null;
    if (typeof p.adminId !== 'string' || typeof p.email !== 'string' || typeof p.name !== 'string') {
      return null;
    }
    if (!(ADMIN_ROLES as readonly string[]).includes(p.role)) return null;
    return { adminId: p.adminId, email: p.email, name: p.name, role: p.role as AdminRole };
  } catch {
    return null;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: EXPIRES_IN_SECONDS,
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return token ? verifyAdminToken(token) : null;
}

/** True when the session may act with `role` (owners can do everything). */
export function hasRole(session: AdminSession, role: AdminRole): boolean {
  return role === 'staff' || session.role === 'owner';
}

/** For API routes and server actions. */
export async function requireAdmin(role: AdminRole = 'staff'): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new UnauthorizedError();
  if (!hasRole(session, role)) throw new ForbiddenError('Owner access required');
  return session;
}

/** For admin pages: redirect to login, or show 404 for a staff user on an owner page. */
export async function requireAdminPage(role: AdminRole = 'staff'): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (!hasRole(session, role)) redirect('/admin?forbidden=1');
  return session;
}
