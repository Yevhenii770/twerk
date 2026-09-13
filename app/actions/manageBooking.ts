"use server";

import { db } from "@/db";
import { bookings, classSessions, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { releaseSeat } from "@/lib/reserve";
import { refundSquarePayment } from "@/lib/square";
import crypto from "crypto";

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

// Self-service cancel-and-refund window: a customer gets their money back automatically if
// EITHER condition holds — they're still within the "oops, changed my mind" grace period right
// after paying, OR the class is far enough out that losing the seat isn't a last-minute problem.
// Outside both, we don't auto-refund — they need to contact us directly.
const REFUND_GRACE_MINUTES = 30;
const REFUND_CUTOFF_HOURS = 24;

export async function cancelOwnBooking(token: string) {
  const data = await getBookingByToken(token);
  if (!data) return { success: false, error: "Booking not found" };
  const { booking, session } = data;

  if (booking.status !== "paid") return { success: false, error: "This booking can't be cancelled." };

  const minutesSincePayment = (Date.now() - booking.createdAt.getTime()) / (1000 * 60);
  const withinGracePeriod = minutesSincePayment < REFUND_GRACE_MINUTES;

  let enoughNotice = true;
  if (session) {
    const classStart = new Date(`${session.date}T${session.startTime}:00`);
    const hoursUntil = (classStart.getTime() - Date.now()) / (1000 * 60 * 60);
    enoughNotice = hoursUntil >= REFUND_CUTOFF_HOURS;
  }

  if (!withinGracePeriod && !enoughNotice) {
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

  const [payment] = await db.select().from(payments).where(eq(payments.id, booking.paymentId)).limit(1);
  if (!payment?.squarePaymentId) {
    return { success: false, error: "No payment on file for this booking. Please contact us directly." };
  }

  const result = await refundSquarePayment({
    paymentId: payment.squarePaymentId,
    amountCents: booking.amountPaidCents ?? payment.amountCents,
    idempotencyKey: crypto.randomUUID(),
    reason: "Customer self-service cancellation",
  });

  if (!result.ok) {
    return { success: false, error: result.error || "Refund failed. Please contact us directly." };
  }

  await db.update(payments).set({ status: "refunded", updatedAt: new Date() }).where(eq(payments.id, payment.id));
  await db.update(bookings).set({ status: "refunded" }).where(eq(bookings.id, booking.id));
  if (booking.sessionId) await releaseSeat(booking.sessionId);

  revalidateTag("bookings");
  return { success: true };
}
