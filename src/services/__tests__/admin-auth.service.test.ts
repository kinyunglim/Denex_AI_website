import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ObjectId, WithId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { AdminAuthService } from '@/src/services/admin-auth.service';
import { AdminDao } from '@/src/dao/admin.dao';
import { AdminUser } from '@/src/models/admin-user';
import { Mailer } from '@/src/lib/email';
import { hasRole, signAdminToken, verifyAdminToken } from '@/src/lib/admin-session';

const env = process.env as Record<string, string | undefined>;

const buildAdmin = (overrides: Partial<WithId<AdminUser>> = {}): WithId<AdminUser> => ({
  _id: new ObjectId(),
  email: 'owner@client.com',
  password: 'hashed',
  name: 'Owner',
  role: 'owner',
  permissions: ['all'],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AdminAuthService.login', () => {
  const originalEnv = { ...env };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(AdminDao, 'updateById').mockResolvedValue(true);
    jest.spyOn(Mailer, 'send').mockResolvedValue(undefined);
  });

  afterEach(() => {
    env.DEFAULT_ADMIN = originalEnv.DEFAULT_ADMIN;
    env.NODE_ENV = originalEnv.NODE_ENV;
  });

  it('allows the default admin in development when enabled', async () => {
    env.DEFAULT_ADMIN = 'true';
    env.NODE_ENV = 'development';
    const result = await AdminAuthService.login({ email: 'admin', password: 'admin' });
    expect(result).toEqual({ mfaRequired: false, session: expect.objectContaining({ role: 'owner' }) });
  });

  it('never allows the default admin in production', async () => {
    env.DEFAULT_ADMIN = 'true';
    env.NODE_ENV = 'production';
    jest.spyOn(AdminDao, 'findByEmail').mockResolvedValue(null);
    await expect(AdminAuthService.login({ email: 'admin', password: 'admin' })).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('sends an OTP after a correct password', async () => {
    jest.spyOn(AdminDao, 'findByEmail').mockResolvedValue(buildAdmin());
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    const result = await AdminAuthService.login({ email: 'Owner@Client.com', password: 'secret-pass' });
    expect(AdminDao.findByEmail).toHaveBeenCalledWith('owner@client.com');
    expect(result).toEqual({ mfaRequired: true, email: 'owner@client.com' });
    expect(Mailer.send).toHaveBeenCalled();
  });

  it('rejects a wrong password', async () => {
    jest.spyOn(AdminDao, 'findByEmail').mockResolvedValue(buildAdmin());
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
    await expect(AdminAuthService.login({ email: 'owner@client.com', password: 'x' })).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('rejects a deactivated admin', async () => {
    jest.spyOn(AdminDao, 'findByEmail').mockResolvedValue(buildAdmin({ isActive: false }));
    await expect(AdminAuthService.login({ email: 'owner@client.com', password: 'x' })).rejects.toThrow(
      'deactivated'
    );
  });
});

describe('AdminAuthService.verifyOtp', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(AdminDao, 'updateById').mockResolvedValue(true);
  });

  it('returns a session for a valid code', async () => {
    const admin = buildAdmin({ role: 'staff', otp: { code: '123456', expiresAt: new Date(Date.now() + 60_000) } });
    jest.spyOn(AdminDao, 'findByEmail').mockResolvedValue(admin);
    const session = await AdminAuthService.verifyOtp('owner@client.com', '123456');
    expect(session).toEqual({ adminId: admin._id.toString(), email: admin.email, name: 'Owner', role: 'staff' });
  });

  it('rejects an expired code', async () => {
    const admin = buildAdmin({ otp: { code: '123456', expiresAt: new Date(Date.now() - 1) } });
    jest.spyOn(AdminDao, 'findByEmail').mockResolvedValue(admin);
    await expect(AdminAuthService.verifyOtp('owner@client.com', '123456')).rejects.toThrow('expired');
  });

  it('rejects a wrong code', async () => {
    const admin = buildAdmin({ otp: { code: '123456', expiresAt: new Date(Date.now() + 60_000) } });
    jest.spyOn(AdminDao, 'findByEmail').mockResolvedValue(admin);
    await expect(AdminAuthService.verifyOtp('owner@client.com', '000000')).rejects.toThrow('expired');
  });
});

describe('admin session tokens', () => {
  const session = { adminId: 'a1', email: 'a@b.c', name: 'A', role: 'staff' as const };

  it('round-trips a signed token', () => {
    expect(verifyAdminToken(signAdminToken(session))).toEqual(session);
  });

  it('rejects a tampered token', () => {
    const token = signAdminToken(session);
    expect(verifyAdminToken(token.slice(0, -2) + 'xx')).toBeNull();
  });

  it('owners have every role, staff only staff', () => {
    expect(hasRole({ ...session, role: 'owner' }, 'owner')).toBe(true);
    expect(hasRole(session, 'owner')).toBe(false);
    expect(hasRole(session, 'staff')).toBe(true);
  });
});
