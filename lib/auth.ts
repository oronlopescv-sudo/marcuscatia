// Admin session: an HMAC-signed, httpOnly cookie. Uses Web Crypto so the
// same code runs in middleware (edge) and in route handlers (node).

export const SESSION_COOKIE = 'catia_admin';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12h

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.DB_PASSWORD;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-insecure-secret';
  throw new Error('ADMIN_SESSION_SECRET (or DB_PASSWORD) must be set');
}

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  return `${exp}.${await hmac(String(exp))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!exp || !sig || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(expStr);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

function readCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  return verifySessionToken(readCookie(request.headers.get('cookie'), SESSION_COOKIE));
}
