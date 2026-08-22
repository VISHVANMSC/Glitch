// In-Memory Sliding Window Rate Limiter for Abuse & Brute-Force Protection
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000); // 1 hour max window
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);

export function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; retryAfterMs: number } {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterMs = oldest ? oldest + windowMs - now : windowMs;
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 1000),
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.timestamps.length,
    retryAfterMs: 0,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
