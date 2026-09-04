import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

/**
 * Atomically claims one seat on a session, in a single UPDATE statement so concurrent
 * requests can't both succeed for the last spot (Postgres serializes the row write —
 * this holds even over the Neon HTTP driver, which doesn't support multi-statement
 * transactions). Returns false if the session is sold out, closed, or cancelled.
 */
export async function claimSeat(sessionId: number): Promise<boolean> {
  const result = await db
    .update(classSessions)
    .set({ booked: sql`${classSessions.booked} + 1`, updatedAt: new Date() })
    .where(and(
      eq(classSessions.id, sessionId),
      eq(classSessions.bookingOpen, true),
      eq(classSessions.cancelled, false),
      sql`${classSessions.booked} < ${classSessions.capacity}`,
    ))
    .returning();

  if (result.length > 0) {
    revalidateTag("class-sessions");
    return true;
  }
  return false;
}

/** Releases a previously-claimed seat (payment failed, or booking was cancelled). */
export async function releaseSeat(sessionId: number): Promise<void> {
  await db
    .update(classSessions)
    .set({ booked: sql`greatest(${classSessions.booked} - 1, 0)`, updatedAt: new Date() })
    .where(eq(classSessions.id, sessionId));
  revalidateTag("class-sessions");
}
