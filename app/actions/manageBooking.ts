"use server";

import { db } from "@/db";
import { bookings, classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { releaseSeat } from "@/lib/reserve";
import { refundBookingPayment } from "@/lib/refund";
import { classStartUtc } from "@/lib/studioTime";
import { rateLimit } from "@/lib/rateLimit";
import { isRefundEligible, REFUND_GRACE_MINUTES, REFUND_CUTOFF_HOURS } from "@/lib/refundPolicy";

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

export async function cancelOwnBooking(token: string) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`cancel-booking:${ip}`, 10, 10 * 60 * 1000)) {
    return { success: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const data = await getBookingByToken(token);
  if (!data) return { success: false, error: "Booking not found" };
  const { booking, session } = data;

  if (booking.status !== "paid") return { success: false, error: "This booking can't be cancelled." };

  const eligible = isRefundEligible({
    paidAt: booking.createdAt,
    classStart: session ? classStartUtc(session.date, session.startTime) : null,
  });

  if (!eligible) {
    return {
      success: false,
      error: `Refunds are only available within ${REFUND_GRACE_MINUTES} minutes of booking, or if your class is more than ${REFUND_CUTOFF_HOURS} hours away. Please contact us directly.`,
    };
  }

  if (!booking.paymentId) {
    // Shouldn't happen for a "paid" booking, but don't block a cancellation over it.
    await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, booking.id));
    if (booking.sessionId) await releaseSeat(booking.sessionId);
    revalidateTag("bookings");
    return { success: true };
  }

  return refundBookingPayment(booking.id, "Customer self-service cancellation");
}
