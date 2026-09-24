import { NextResponse } from 'next/server';
import { VerifyOtpSchema } from '@/src/models/admin-user';
import { AdminAuthService } from '@/src/services/admin-auth.service';
import { fail, parseInput, readJson } from '@/src/lib/api';
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from '@/src/lib/admin-session';
import { checkRateLimit, clientIp } from '@/src/lib/rate-limit';

/**
 * POST /api/admin/auth/verify-otp
 * Step 2: verify the emailed code and set the httpOnly session cookie.
 */
export async function POST(request: Request) {
  try {
    checkRateLimit(`admin-otp:${clientIp(request)}`, 10, 10 * 60_000);
    const { email, code } = parseInput(VerifyOtpSchema, await readJson(request));
    const session = await AdminAuthService.verifyOtp(email, code);
    const response = NextResponse.json({ ok: true, data: { name: session.name, role: session.role } });
    response.cookies.set(ADMIN_COOKIE, signAdminToken(session), adminCookieOptions);
    return response;
  } catch (error) {
    return fail(error);
  }
}
