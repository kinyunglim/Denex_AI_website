import { RateLimitError } from '@/src/lib/errors';

/**
 * In-memory fixed-window rate limiter.
 * Approach: good enough for a single serverless instance's burst protection
 * on public forms; not a security boundary on its own (honeypot helps too).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): void {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (bucket.count >= limit) throw new RateLimitError();
  bucket.count += 1;
}

export function resetRateLimits(): void {
  buckets.clear();
}

/** Best-effort client IP from proxy headers. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}
