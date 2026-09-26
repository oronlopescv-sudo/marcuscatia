import { NextResponse } from 'next/server';
import { timingSafeEqual, createHash } from 'crypto';
import { getSetting } from '@/lib/settings';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, isAdminRequest } from '@/lib/auth';
import { clientIp, isLoginLockedOut, recordLoginFailure, clearLoginFailures } from '@/lib/rateLimit';

const DEFAULT_PIN = '1234';

// Brute-force guard: max failed attempts per IP per window, plus a backstop
// across all IPs combined (against an attacker rotating a spoofed
// X-Forwarded-For to dodge the per-IP limit). Backed by MySQL, not
// in-memory — this app can run as more than one worker process, and
// separate processes don't share a plain in-memory counter.
const MAX_FAILURES_PER_IP = 10;
const MAX_FAILURES_GLOBAL = 50;
const WINDOW_MS = 15 * 60 * 1000;

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
  if (await isLoginLockedOut(ip, MAX_FAILURES_PER_IP, MAX_FAILURES_GLOBAL, WINDOW_MS)) {
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
      await recordLoginFailure(ip);
      return NextResponse.json({ ok: false });
    }

    await clearLoginFailures(ip);
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
