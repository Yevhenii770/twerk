"use server";

import { db } from "@/db";
import { bookings, classSessions, type Booking, type ClassSession } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
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

  // A Monthly Pass links several bookings (one per class date) via bookingGroupId — fetch the
  // siblings too so the manage page can show/act on the whole pass, not just this one date.
  let groupBookings: { booking: Booking; session: ClassSession | null }[] = [];
  if (booking.bookingGroupId) {
    const siblings = await db.select().from(bookings).where(eq(bookings.bookingGroupId, booking.bookingGroupId));
    const sessionIds = siblings.map((b) => b.sessionId).filter((id): id is number => id != null);
    const sessionRows = sessionIds.length
      ? await db.select().from(classSessions).where(inArray(classSessions.id, sessionIds))
      : [];
    const sessionById = new Map(sessionRows.map((s) => [s.id, s]));
    groupBookings = siblings
      .map((b) => ({ booking: b, session: b.sessionId ? sessionById.get(b.sessionId) ?? null : null }))
      .sort((a, b) => (a.session?.date ?? "").localeCompare(b.session?.date ?? "") || (a.session?.startTime ?? "").localeCompare(b.session?.startTime ?? ""));
  }

  return { booking, session, groupBookings };
}

export async function cancelOwnBooking(token: string) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`cancel-booking:${ip}`, 10, 10 * 60 * 1000)) {
    return { success: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const data = await getBookingByToken(token);
  if (!data) return { success: false, error: "Booking not found" };
  const { booking, session, groupBookings } = data;

  // For a Monthly Pass, cancelling refunds and releases the whole group in one shot (see
  // refundBookingPayment), so eligibility must reflect the whole pass: any date already
  // cancelled individually, and the earliest class across all dates (not just this token's own
  // one) governs the 24h cutoff — that way a pass with a class already underway/passed can't be
  // fully refunded through the date that happens to still be far out.
  const isGroup = groupBookings.length > 1;
  const hasPaidBooking = isGroup ? groupBookings.some((g) => g.booking.status === "paid") : booking.status === "paid";
  if (!hasPaidBooking) return { success: false, error: "This booking can't be cancelled." };

  const relevantSessions = isGroup
    ? groupBookings.map((g) => g.session).filter((s): s is ClassSession => s != null)
    : session ? [session] : [];

  const earliestClassStart = relevantSessions.length
    ? relevantSessions.reduce<Date | null>((earliest, s) => {
        const start = classStartUtc(s.date, s.startTime);
        return !earliest || start < earliest ? start : earliest;
      }, null)
    : null;

  const eligible = isRefundEligible({
    paidAt: booking.createdAt,
    classStart: earliestClassStart,
  });

  if (!eligible) {
    return {
      success: false,
      error: `Refunds are only available within ${REFUND_GRACE_MINUTES} minutes of booking, or if your class${isGroup ? "es are" : " is"} more than ${REFUND_CUTOFF_HOURS} hours away. Please contact us directly.`,
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
