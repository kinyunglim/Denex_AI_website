import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/src/i18n/routing';
import { THEMES } from '@/src/lib/config';

/**
 * Next.js 16 proxy (formerly middleware):
 *  - /api/*    → central CORS (kept from VTCS so the Flutter app can call the API)
 *  - /admin/*  → untouched (admin is not localised)
 *  - others    → next-intl locale negotiation; in preview mode `?theme=` is
 *                remembered in a cookie so prospects can flip between themes.
 */
const intl = createMiddleware(routing);

function corsHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set(
    'Access-Control-Allow-Headers',
    request.headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization, X-Requested-With'
  );
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

/** Paths that need the database; hidden on a showcase deployment (SHOWCASE_MODE=1). */
const DB_ONLY = ['/admin', '/api/admin', '/api/auth', '/api/user', '/api/booking', '/api/stripe', '/api/orders/stripe-webhook'];

export default function proxy(request: NextRequest): NextResponse {
  const { pathname, searchParams } = request.nextUrl;

  if (process.env.SHOWCASE_MODE === '1' && DB_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (pathname.startsWith('/api/')) {
    const cors = corsHeaders(request);
    if (request.method === 'OPTIONS') return new NextResponse(null, { status: 204, headers: cors });
    const response = NextResponse.next();
    cors.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  if (pathname.startsWith('/admin')) return NextResponse.next();

  const response = intl(request);
  const theme = searchParams.get('theme');
  if (process.env.PREVIEW_MODE === '1' && theme && (THEMES as readonly string[]).includes(theme)) {
    response.cookies.set('preview_theme', theme, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
  }
  return response;
}

export const config = {
  // Skip Next internals and files with an extension.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)', '/api/:path*'],
};
