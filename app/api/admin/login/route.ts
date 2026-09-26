import { NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';
import { getSetting } from '@/lib/settings';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, isAdminRequest } from '@/lib/auth';

const DEFAULT_PIN = '1234';

// Brute-force guard: max failed attempts per IP per window (in-memory).
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

// Backstop against an attacker rotating a spoofed X-Forwarded-For to dodge
// the per-IP limit above: also cap total failures across ALL IPs combined.
const GLOBAL_MAX_FAILURES = 50;
let globalFailureCount = 0;
let globalWindowStart = 0;

function clientIp(request: Request): string {
  // x-real-ip is normally set by the reverse proxy itself to the true peer
  // address (not attacker-controlled); x-forwarded-for can have arbitrary
  // client-supplied entries prepended, so it's only a fallback.
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

function isLockedOut(ip: string): boolean {
  if (Date.now() - globalWindowStart > WINDOW_MS) {
    globalWindowStart = Date.now();
    globalFailureCount = 0;
  }
  if (globalFailureCount >= GLOBAL_MAX_FAILURES) return true;

  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(ip: string) {
  globalFailureCount++;
  const entry = failures.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failures.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count++;
  }
}

// Fixed-length digests sidestep timingSafeEqual's "buffers must be the same
// length" requirement (which would otherwise leak the real PIN's length via
// a plain !== early-exit) while still comparing in constant time.
function pinsMatch(a: string, b: string): boolean {
  const digestA = createHash('sha256').update(a).digest();
  const digestB = createHash('sha256').update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

// GET — is the current browser logged in?
export async function GET(request: Request) {
  return NextResponse.json({ ok: await isAdminRequest(request) });
}

// POST — log in with the PIN; sets the session cookie.
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isLockedOut(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const { pin } = await request.json();
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ ok: false, error: 'PIN required' }, { status: 400 });
    }

    const stored = (await getSetting('admin_pin')) || DEFAULT_PIN;
    if (!pinsMatch(pin, stored)) {
      recordFailure(ip);
      return NextResponse.json({ ok: false });
    }

    failures.delete(ip);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ ok: false, error: 'Could not verify the PIN' }, { status: 500 });
  }
}

// DELETE — log out.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
