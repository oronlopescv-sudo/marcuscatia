// Best-effort protection for public POST endpoints and the admin login: the
// client-side 30s throttle these forms already have only guards the browser
// UI, and is skipped entirely by calling the API directly.
//
// Backed by MySQL rather than an in-memory Map: this app can run as more
// than one worker process under Hostinger's LiteSpeed Node manager, and
// separate processes don't share JS memory. Confirmed empirically — 10
// rapid requests from the same IP all sailed through a configured 8-request
// in-memory limit, because they landed on different worker processes each
// keeping their own separate counter. A shared table is the only way all
// workers agree on the same count.

import { query } from '@/lib/db';

export const RATE_LIMIT_TABLE_SQL = `CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  bucket VARCHAR(64) NOT NULL,
  rate_key VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bucket_key_time (bucket, rate_key, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await query(RATE_LIMIT_TABLE_SQL);
  tableReady = true;
}

// x-real-ip is normally set by the reverse proxy itself to the true peer
// address (not attacker-controlled); x-forwarded-for can have arbitrary
// client-supplied entries prepended, so it's only a fallback.
export function clientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

async function recordHit(bucket: string, key: string) {
  await ensureTable();
  await query('INSERT INTO rate_limit_hits (bucket, rate_key) VALUES (?, ?)', [bucket, key]);
  // Opportunistic cleanup instead of a dedicated cron job — cheap and rare
  // enough not to matter, keeps the table from growing forever.
  if (Math.random() < 0.02) {
    query('DELETE FROM rate_limit_hits WHERE created_at < (NOW() - INTERVAL 1 DAY)').catch(() => {});
  }
}

// key === null counts every row in the bucket regardless of key (used for a
// cross-IP backstop, e.g. an attacker rotating a spoofed X-Forwarded-For).
async function countHits(bucket: string, key: string | null, windowSeconds: number): Promise<number> {
  await ensureTable();
  const rows = (
    key === null
      ? await query(
          'SELECT COUNT(*) AS n FROM rate_limit_hits WHERE bucket = ? AND created_at > (NOW() - INTERVAL ? SECOND)',
          [bucket, windowSeconds]
        )
      : await query(
          'SELECT COUNT(*) AS n FROM rate_limit_hits WHERE bucket = ? AND rate_key = ? AND created_at > (NOW() - INTERVAL ? SECOND)',
          [bucket, key, windowSeconds]
        )
  ) as { n: number }[];
  return Number(rows?.[0]?.n) || 0;
}

async function clearHits(bucket: string, key: string) {
  await ensureTable();
  await query('DELETE FROM rate_limit_hits WHERE bucket = ? AND rate_key = ?', [bucket, key]);
}

// Records a hit and returns true if `key` has exceeded `max` hits to
// `bucket` within the last `windowMs`. Fails open (allows the request) if
// the check itself errors — a broken limiter must not take the site down.
export async function isRateLimited(bucket: string, key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    await recordHit(bucket, key);
    return (await countHits(bucket, key, Math.ceil(windowMs / 1000))) > max;
  } catch (error) {
    console.error(`isRateLimited(${bucket}) failed, allowing the request:`, error);
    return false;
  }
}

// --- Admin login brute-force guard: per-IP, plus a cross-IP backstop ---

const LOGIN_BUCKET = 'admin-login-fail';

export async function isLoginLockedOut(ip: string, maxPerIp: number, maxGlobal: number, windowMs: number): Promise<boolean> {
  try {
    const seconds = Math.ceil(windowMs / 1000);
    const [ipCount, globalCount] = await Promise.all([
      countHits(LOGIN_BUCKET, ip, seconds),
      countHits(LOGIN_BUCKET, null, seconds),
    ]);
    return ipCount >= maxPerIp || globalCount >= maxGlobal;
  } catch (error) {
    console.error('isLoginLockedOut failed, allowing the request:', error);
    return false;
  }
}

export async function recordLoginFailure(ip: string) {
  try {
    await recordHit(LOGIN_BUCKET, ip);
  } catch (error) {
    console.error('recordLoginFailure failed:', error);
  }
}

export async function clearLoginFailures(ip: string) {
  try {
    await clearHits(LOGIN_BUCKET, ip);
  } catch (error) {
    console.error('clearLoginFailures failed:', error);
  }
}
