import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, isAdminRequest } from '@/lib/auth';

const DEFAULT_PIN = '1234';

// Brute-force guard: max failed attempts per IP per window (in-memory).
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

function clientIp(request: Request): string {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

function isLockedOut(ip: string): boolean {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(ip: string) {
  const entry = failures.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failures.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count++;
  }
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
    if (pin !== stored) {
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
