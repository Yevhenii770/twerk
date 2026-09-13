import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rateLimit";

// No UPSTASH_REDIS_REST_URL/TOKEN is set in the test environment, so these exercise the
// in-memory fallback path — the same one that runs in production with no Redis configured.
describe("rateLimit", () => {
  it("allows requests under the limit", async () => {
    const key = `test-${Math.random()}`;
    expect(await rateLimit(key, 3, 60_000)).toBe(true);
    expect(await rateLimit(key, 3, 60_000)).toBe(true);
    expect(await rateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks requests once the limit is exceeded", async () => {
    const key = `test-${Math.random()}`;
    await rateLimit(key, 2, 60_000);
    await rateLimit(key, 2, 60_000);
    expect(await rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("tracks distinct keys independently", async () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    await rateLimit(keyA, 1, 60_000);
    expect(await rateLimit(keyA, 1, 60_000)).toBe(false);
    expect(await rateLimit(keyB, 1, 60_000)).toBe(true);
  });
});
