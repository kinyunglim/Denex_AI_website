import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/src/lib/admin-session';

/** POST /api/admin/auth/logout — clears the session cookie. */
export async function POST() {
  const response = NextResponse.json({ ok: true, data: null });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
