// Lightweight in-memory rate limiter for sensitive server actions (booking creation, payment
// attempts, contact form). Per-serverless-instance only — not a substitute for an edge/WAF
// rate limiter under real abuse, but it meaningfully slows down casual scripted abuse on a
// low-traffic site without adding infra. See README/SETUP notes for a Redis-backed upgrade path.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
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
