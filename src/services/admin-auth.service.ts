import bcrypt from 'bcryptjs';
import { AdminLoginInput } from '@/src/models/admin-user';
import { AdminDao } from '@/src/dao/admin.dao';
import { generateOtp, getOtpExpiration } from '@/src/lib/otp';
import { Mailer } from '@/src/lib/email';
import { AdminSession } from '@/src/lib/admin-session';
import { ForbiddenError, UnauthorizedError } from '@/src/lib/errors';

export type LoginResult =
  | { mfaRequired: true; email: string }
  | { mfaRequired: false; session: AdminSession };

/**
 * Admin authentication with email OTP as the second factor.
 * Approach: step 1 checks the password and emails a code; step 2 checks the
 * code and returns the session (the route stores it in an httpOnly cookie).
 */
export class AdminAuthService {
  /** The dev-only admin/admin shortcut. Never available in production. */
  static isDefaultAdminAllowed(): boolean {
    return process.env.DEFAULT_ADMIN === 'true' && process.env.NODE_ENV !== 'production';
  }

  static async login(input: AdminLoginInput): Promise<LoginResult> {
    const { email, password } = input;

    if (this.isDefaultAdminAllowed() && email === 'admin' && password === 'admin') {
      return {
        mfaRequired: false,
        session: { adminId: 'default-admin', email: 'admin@localhost', name: 'Dev Admin', role: 'owner' },
      };
    }

    const admin = await AdminDao.findByEmail(email.trim().toLowerCase());
    if (!admin) throw new UnauthorizedError('Invalid credentials');
    if (!admin.isActive) throw new ForbiddenError('Admin account is deactivated');

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');

    const otpCode = generateOtp();
    await AdminDao.updateById(admin._id.toString(), {
      $set: { otp: { code: otpCode, expiresAt: getOtpExpiration(5) }, updatedAt: new Date() },
    });

    await Mailer.send({
      to: admin.email,
      subject: 'Admin login verification code / 後台登入驗證碼',
      html: `<p>Your verification code / 你的驗證碼：</p>
             <h2 style="font-size:32px;letter-spacing:6px">${otpCode}</h2>
             <p>Expires in 5 minutes / 5 分鐘內有效</p>`,
    });

    return { mfaRequired: true, email: admin.email };
  }

  static async verifyOtp(email: string, code: string): Promise<AdminSession> {
    const admin = await AdminDao.findByEmail(email.trim().toLowerCase());
    if (!admin || !admin.isActive) throw new UnauthorizedError('Invalid session');

    const expired = !admin.otp?.expiresAt || admin.otp.expiresAt < new Date();
    if (!admin.otp?.code || admin.otp.code !== code || expired) {
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    await AdminDao.updateById(admin._id.toString(), {
      $unset: { otp: '' },
      $set: { lastLogin: new Date(), updatedAt: new Date() },
    });

    return {
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role ?? 'staff',
    };
  }
}
