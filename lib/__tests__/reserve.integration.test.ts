import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

// revalidateTag requires a live Next.js request context (server action / route handler);
// outside of one (like this test runner) it throws. Stub it here — this test verifies the
// database write semantics of claimSeat/releaseSeat, not Next's cache invalidation.
vi.mock("next/cache", () => ({ revalidateTag: () => {} }));

const { db } = await import("@/db");
const { classSessions } = await import("@/db/schema");
const { eq } = await import("drizzle-orm");
const { claimSeat, releaseSeat } = await import("@/lib/reserve");

// Exercises the actual overbooking guard against the real database: this is the single most
// important correctness property in the whole booking system (two people must never win the
// last seat), and it can only be verified honestly against real concurrent Postgres writes —
// not a mock. Creates and always cleans up its own throwaway session row.
const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("claimSeat concurrency", () => {
  let sessionId: number;

  beforeAll(async () => {
    const [row] = await db.insert(classSessions).values({
      classType: "__test__",
      date: "2099-01-01",
      startTime: "00:00",
      endTime: "01:00",
      price: 1,
      capacity: 5,
      booked: 0,
    }).returning();
    sessionId = row.id;
  });

  afterAll(async () => {
    if (sessionId) await db.delete(classSessions).where(eq(classSessions.id, sessionId));
  });

  it("never allows more concurrent claims to succeed than capacity", async () => {
    const attempts = 20;
    const results = await Promise.all(Array.from({ length: attempts }, () => claimSeat(sessionId)));
    const successes = results.filter(Boolean).length;
    expect(successes).toBe(5);

    const [row] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
    expect(row.booked).toBe(5);
  });

  it("releaseSeat frees a spot back up without going negative", async () => {
    await releaseSeat(sessionId);
    const [row] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
    expect(row.booked).toBe(4);

    const claimed = await claimSeat(sessionId);
    expect(claimed).toBe(true);

    // Releasing far more than were ever booked must clamp at zero, never go negative.
    for (let i = 0; i < 10; i++) await releaseSeat(sessionId);
    const [after] = await db.select().from(classSessions).where(eq(classSessions.id, sessionId));
    expect(after.booked).toBe(0);
  });

  it("rejects claims once the session is closed or cancelled", async () => {
    await db.update(classSessions).set({ bookingOpen: false }).where(eq(classSessions.id, sessionId));
    expect(await claimSeat(sessionId)).toBe(false);

    await db.update(classSessions).set({ bookingOpen: true, cancelled: true }).where(eq(classSessions.id, sessionId));
    expect(await claimSeat(sessionId)).toBe(false);
  });
});
