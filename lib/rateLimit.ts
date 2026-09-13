import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// In-memory limiter: per-serverless-instance only — meaningfully slows down casual scripted
// abuse on a low-traffic site, but a botnet spread across many instances/IPs isn't capped by
// it. Kept as the fallback so rate limiting still works with zero configuration.
const hits = new Map<string, number[]>();

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > windowMs)) hits.delete(k);
    }
  }
  return true;
}

// Redis-backed limiter: shared across every serverless instance, so it actually holds under
// real distributed abuse (e.g. a botnet spreading login attempts across many IPs/instances).
// Activates automatically once UPSTASH_REDIS_REST_URL/TOKEN are set (a free Upstash Redis
// database — https://upstash.com — takes about two minutes to create); with no env vars set,
// `redis` stays null and every call falls back to the in-memory limiter above, so this is safe
// to ship with or without that setup done.
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

// One Ratelimit instance per distinct (limit, windowMs) pair, reused across calls — each call
// site in this codebase always passes the same pair, so this cache stays tiny.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  const existing = limiters.get(cacheKey);
  if (existing) return existing;

  const rl = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms` as `${number} ms`),
    prefix: "ratelimit",
  });
  limiters.set(cacheKey, rl);
  return rl;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!redis) return memoryRateLimit(key, limit, windowMs);

  try {
    const { success } = await getLimiter(limit, windowMs).limit(key);
    return success;
  } catch {
    // Redis unreachable — fail open to the in-memory limiter rather than blocking real traffic.
    return memoryRateLimit(key, limit, windowMs);
  }
}
