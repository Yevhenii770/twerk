import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { releaseSeat } from "@/lib/reserve";
import { refundSquarePayment } from "@/lib/square";
import crypto from "crypto";

export type RefundResult = { success: true } | { success: false; error: string };

/**
 * Refunds a booking's Square payment in full and marks it (and any other booking sharing the
 * same payment) refunded, freeing every seat involved. Shared by the admin refund button and
 * the customer self-service "Cancel & refund" flow.
 *
 * A Monthly Pass is one payment linking several bookings (one per class date, via
 * bookingGroupId) — refunding it must refund and release the whole group, not just the single
 * booking the caller happened to act on, or the customer would keep the other classes for free
 * while getting all their money back. Looking the group up by paymentId (rather than trusting
 * bookingGroupId to be set) also makes this safe as the one place that ever refunds a payment.
 *
 * The payments.completed -> refunding transition is a single conditional UPDATE (status =
 * 'completed' in the WHERE clause), the same atomic-claim pattern used for seat claiming in
 * lib/reserve.ts. That's what makes this safe against two refund attempts racing on the same
 * booking (a double-click, or the customer and an admin both acting on it at once): only one
 * request's UPDATE can match the row while it's still 'completed', so only one ever reaches
 * Square. The other sees zero rows affected and bails out without charging anything twice.
 */
export async function refundBookingPayment(bookingId: number, reason: string): Promise<RefundResult> {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking || !booking.paymentId) return { success: false, error: "No payment on this booking." };

  const claimed = await db.update(payments)
    .set({ status: "refunding", updatedAt: new Date() })
    .where(and(eq(payments.id, booking.paymentId), eq(payments.status, "completed")))
    .returning();

  if (claimed.length === 0) {
    const [current] = await db.select().from(payments).where(eq(payments.id, booking.paymentId)).limit(1);
    if (current?.status === "refunded") return { success: true };
    return { success: false, error: "This payment can't be refunded right now. Please contact us directly." };
  }

  const payment = claimed[0];
  if (!payment.squarePaymentId) {
    await db.update(payments).set({ status: "completed", updatedAt: new Date() }).where(eq(payments.id, payment.id));
    return { success: false, error: "No Square payment on file. Please contact us directly." };
  }

  // Resolve every booking this payment covers before touching anything else, so a partial
  // Monthly Pass state (e.g. one date already cancelled by an admin without refund) is handled
  // correctly below rather than only ever seeing the one booking the caller passed in.
  const linkedBookings = await db.select().from(bookings).where(eq(bookings.paymentId, payment.id));

  const result = await refundSquarePayment({
    paymentId: payment.squarePaymentId,
    amountCents: payment.amountCents,
    idempotencyKey: crypto.randomUUID(),
    reason,
  });

  if (!result.ok) {
    // Release the claim so a retry (or a different admin/customer action) can try again.
    await db.update(payments).set({ status: "completed", updatedAt: new Date() }).where(eq(payments.id, payment.id));
    return { success: false, error: result.error || "Refund failed. Please contact us directly." };
  }

  await db.update(payments).set({ status: "refunded", updatedAt: new Date() }).where(eq(payments.id, payment.id));
  for (const linked of linkedBookings) {
    if (linked.status !== "paid") continue; // already cancelled/refunded independently — leave as-is
    await db.update(bookings).set({ status: "refunded" }).where(eq(bookings.id, linked.id));
    if (linked.sessionId) await releaseSeat(linked.sessionId);
  }

  revalidateTag("bookings");
  return { success: true };
}
