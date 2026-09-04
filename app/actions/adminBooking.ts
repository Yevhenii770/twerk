"use server";

import { db } from "@/db";
import { bookings, classSessions, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { releaseSeat } from "@/lib/reserve";
import { refundSquarePayment } from "@/lib/square";
import crypto from "crypto";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Not authorized");
  return user;
}

/** Cancels a booking and frees its seat. Does NOT refund the payment — use refundBooking for that. */
export async function cancelPaidBooking(id: number) {
  await requireAdmin();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking) return { success: false, error: "Booking not found" };
  if (booking.status === "cancelled" || booking.status === "refunded") return { success: true };

  await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, id));
  if (booking.sessionId) await releaseSeat(booking.sessionId);

  revalidateTag("bookings");
  return { success: true };
}

/** Refunds the Square payment in full and cancels the booking, freeing the seat. */
export async function refundPaidBooking(id: number) {
  await requireAdmin();
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking || !booking.paymentId) return { success: false, error: "No payment on this booking" };

  const [payment] = await db.select().from(payments).where(eq(payments.id, booking.paymentId)).limit(1);
  if (!payment?.squarePaymentId) return { success: false, error: "No Square payment on file" };
  if (payment.status === "refunded") return { success: true };

  const result = await refundSquarePayment({
    paymentId: payment.squarePaymentId,
    amountCents: booking.amountPaidCents ?? payment.amountCents,
    idempotencyKey: crypto.randomUUID(),
    reason: "Admin-initiated refund",
  });

  if (!result.ok) return { success: false, error: result.error };

  await db.update(payments).set({ status: "refunded", updatedAt: new Date() }).where(eq(payments.id, payment.id));
  await db.update(bookings).set({ status: "refunded" }).where(eq(bookings.id, id));
  if (booking.sessionId) await releaseSeat(booking.sessionId);

  revalidateTag("bookings");
  return { success: true };
}

export async function markAttendance(id: number, attended: boolean) {
  await requireAdmin();
  await db.update(bookings).set({ attended }).where(eq(bookings.id, id));
  revalidateTag("bookings");
  return { success: true };
}

const ContactSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().regex(/^[\d\s\-+()]{10,}$/),
});

export async function updateBookingContact(id: number, input: z.infer<typeof ContactSchema>) {
  await requireAdmin();
  const parsed = ContactSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid contact details" };

  const { firstName, lastName, email, phone } = parsed.data;
  await db.update(bookings).set({
    firstName, lastName, name: `${firstName} ${lastName}`, email, phone,
  }).where(eq(bookings.id, id));

  revalidateTag("bookings");
  return { success: true };
}

export async function updateSessionCapacity(sessionId: number, capacity: number) {
  await requireAdmin();
  if (!Number.isInteger(capacity) || capacity < 0 || capacity > 500) {
    return { success: false, error: "Invalid capacity" };
  }
  await db.update(classSessions).set({ capacity, updatedAt: new Date() }).where(eq(classSessions.id, sessionId));
  revalidateTag("class-sessions");
  return { success: true };
}

export async function updateSessionPrice(sessionId: number, price: number) {
  await requireAdmin();
  if (!Number.isInteger(price) || price < 0 || price > 10000) {
    return { success: false, error: "Invalid price" };
  }
  await db.update(classSessions).set({ price, updatedAt: new Date() }).where(eq(classSessions.id, sessionId));
  revalidateTag("class-sessions");
  return { success: true };
}

export async function setSessionBookingOpen(sessionId: number, open: boolean) {
  await requireAdmin();
  await db.update(classSessions).set({ bookingOpen: open, updatedAt: new Date() }).where(eq(classSessions.id, sessionId));
  revalidateTag("class-sessions");
  return { success: true };
}

/** Cancels a whole session (e.g. instructor unavailable). Prevents new bookings; existing
 * bookings on it must still be individually cancelled/refunded by the admin. */
export async function cancelSession(sessionId: number) {
  await requireAdmin();
  await db.update(classSessions).set({ cancelled: true, bookingOpen: false, updatedAt: new Date() }).where(eq(classSessions.id, sessionId));
  revalidateTag("class-sessions");
  return { success: true };
}
