"use server";

import { db } from "@/db";
import { bookings, classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { releaseSeat } from "@/lib/reserve";

// Public, token-gated self-service booking management. The management token (a 32-byte
// random value, see lib/token.ts) is the sole credential — knowing it proves ownership of
// the booking, the same trust model as a password-reset link. Never expose it in logs/URLs
// other than the one-time email/redirect it's meant for.

export async function getBookingByToken(token: string) {
  if (!token) return null;
  const rows = await db.select().from(bookings).where(eq(bookings.managementToken, token)).limit(1);
  const booking = rows[0];
  if (!booking) return null;

  const session = booking.sessionId
    ? (await db.select().from(classSessions).where(eq(classSessions.id, booking.sessionId)).limit(1))[0] ?? null
    : null;

  return { booking, session };
}

const CANCEL_CUTOFF_HOURS = 24;

export async function cancelOwnBooking(token: string) {
  const data = await getBookingByToken(token);
  if (!data) return { success: false, error: "Booking not found" };
  const { booking, session } = data;

  if (booking.status !== "paid") return { success: false, error: "This booking can't be cancelled." };

  if (session) {
    const classStart = new Date(`${session.date}T${session.startTime}:00`);
    const hoursUntil = (classStart.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil < CANCEL_CUTOFF_HOURS) {
      return { success: false, error: `Cancellations must be made at least ${CANCEL_CUTOFF_HOURS} hours before class. Please contact us directly.` };
    }
  }

  await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, booking.id));
  if (booking.sessionId) await releaseSeat(booking.sessionId);

  revalidateTag("bookings");
  return { success: true };
}
