import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// Visitor-facing endpoints. Everything else under /api needs an admin session.
const PUBLIC_ANY = ['/api/admin/login', '/api/admin/migrate', '/api/media', '/api/logo'];
const PUBLIC_GET = [
  '/api/courses',
  '/api/gallery',
  '/api/music',
  '/api/content',
  '/api/blocked-dates',
  '/api/weather',
  '/api/comments',
];
const PUBLIC_POST = ['/api/reservations', '/api/messages', '/api/newsletter', '/api/comments'];

function matches(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (
    matches(pathname, PUBLIC_ANY) ||
    ((method === 'GET' || method === 'HEAD') && matches(pathname, PUBLIC_GET)) ||
    (method === 'POST' && matches(pathname, PUBLIC_POST))
  ) {
    return NextResponse.next();
  }

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export const config = {
  matcher: '/api/:path*',
};
