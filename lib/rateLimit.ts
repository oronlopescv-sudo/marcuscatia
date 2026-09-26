// Best-effort protection for public POST endpoints (reservations, messages,
// newsletter, comments): the client-side 30s throttle these forms already
// have is trivially bypassed by calling the API directly, so without a
// server-side check a script can flood the database with fake entries.
//
// This is an in-memory, single-process, fixed-window limiter — it resets on
// deploy/restart and doesn't share state across instances, which is an
// acceptable trade-off for a small site running as one Node process: it
// stops casual scripted abuse without needing a shared store like Redis.

const buckets = new Map<string, { count: number; first: number }>();

// x-real-ip is normally set by the reverse proxy itself to the true peer
// address (not attacker-controlled); x-forwarded-for can have arbitrary
// client-supplied entries prepended, so it's only a fallback.
export function clientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

// True if `key` (e.g. an IP) has made more than `max` calls to `bucketName`
// within the last `windowMs`.
export function isRateLimited(bucketName: string, key: string, max: number, windowMs: number): boolean {
  const mapKey = `${bucketName}:${key}`;
  const now = Date.now();
  const entry = buckets.get(mapKey);
  if (!entry || now - entry.first > windowMs) {
    buckets.set(mapKey, { count: 1, first: now });
    return false;
  }
  entry.count++;
  return entry.count > max;
}
