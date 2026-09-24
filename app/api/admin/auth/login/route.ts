import { NextResponse } from 'next/server';
import { AdminLoginSchema } from '@/src/models/admin-user';
import { AdminAuthService } from '@/src/services/admin-auth.service';
import { fail, parseInput, readJson } from '@/src/lib/api';
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from '@/src/lib/admin-session';
import { checkRateLimit, clientIp } from '@/src/lib/rate-limit';

/**
 * POST /api/admin/auth/login
 * Step 1: email + password. Sends an OTP (mfaRequired) — or, for the dev-only
 * default admin, signs in immediately by setting the session cookie.
 */
export async function POST(request: Request) {
  try {
    checkRateLimit(`admin-login:${clientIp(request)}`, 10, 10 * 60_000);
    const input = parseInput(AdminLoginSchema, await readJson(request));
    const result = await AdminAuthService.login(input);
    if (result.mfaRequired) {
      return NextResponse.json({ ok: true, data: { mfaRequired: true, email: result.email } });
    }
    const response = NextResponse.json({ ok: true, data: { mfaRequired: false } });
    response.cookies.set(ADMIN_COOKIE, signAdminToken(result.session), adminCookieOptions);
    return response;
  } catch (error) {
    return fail(error);
  }
}
