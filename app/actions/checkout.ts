"use server";

import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { getSessionById, isSoldOut } from "@/lib/sessions";
import { claimSeat, releaseSeat } from "@/lib/reserve";
import { createSquarePayment } from "@/lib/square";
import { generateManagementToken } from "@/lib/token";
import { sendBookingConfirmationEmail, sendAdminBookingNotificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";

const CheckoutSchema = z.object({
  sessionId: z.number().int().positive(),
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().regex(/^[\d\s\-+()]{10,}$/, "Enter a valid phone number"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  sourceId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type CheckoutResult =
  | { success: true; bookingId: number; managementToken: string }
  | { success: false; error: string };

const CLASS_LABELS: Record<string, string> = { twerk: "Twerk", highheels: "High Heels" };

export async function createPaidBooking(input: CheckoutInput): Promise<CheckoutResult> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000)) {
    return { success: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = CheckoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid booking details" };
  }
  const data = parsed.data;

  // Idempotency: a retried click/reload with the same key must never double-charge.
  const existingPayment = await db.select().from(payments).where(eq(payments.idempotencyKey, data.idempotencyKey)).limit(1);
  if (existingPayment[0]?.status === "completed") {
    const existingBooking = await db.select().from(bookings).where(eq(bookings.paymentId, existingPayment[0].id)).limit(1);
    if (existingBooking[0]?.managementToken) {
      return { success: true, bookingId: existingBooking[0].id, managementToken: existingBooking[0].managementToken };
    }
  }
  if (existingPayment[0] && existingPayment[0].status !== "failed") {
    return { success: false, error: "This booking is already being processed." };
  }

  const session = await getSessionById(data.sessionId);
  if (!session) return { success: false, error: "This class no longer exists." };
  if (isSoldOut(session)) return { success: false, error: "Sorry, this class just sold out." };

  const claimed = await claimSeat(data.sessionId);
  if (!claimed) return { success: false, error: "Sorry, this class just sold out." };

  const amountCents = session.price * 100;

  const [paymentRow] = await db.insert(payments).values({
    idempotencyKey: data.idempotencyKey,
    amountCents,
    status: "pending",
  }).returning();

  const paymentResult = await createSquarePayment({
    sourceId: data.sourceId,
    idempotencyKey: data.idempotencyKey,
    amountCents,
    buyerEmail: data.email,
    note: `${CLASS_LABELS[session.classType] ?? session.classType} — ${session.date}`,
  });

  if (!paymentResult.ok) {
    await releaseSeat(data.sessionId);
    await db.update(payments).set({ status: "failed", updatedAt: new Date() }).where(eq(payments.id, paymentRow.id));
    return { success: false, error: paymentResult.error || "Payment failed. Please check your card details and try again." };
  }

  await db.update(payments).set({
    status: "completed",
    squarePaymentId: paymentResult.paymentId,
    squareOrderId: paymentResult.orderId,
    updatedAt: new Date(),
  }).where(eq(payments.id, paymentRow.id));

  const managementToken = generateManagementToken();

  const [booking] = await db.insert(bookings).values({
    name: `${data.firstName} ${data.lastName}`,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    notes: data.notes || null,
    classType: session.classType,
    bookingType: "dropin",
    date: session.date,
    price: session.price,
    status: "paid",
    sessionId: session.id,
    paymentId: paymentRow.id,
    amountPaidCents: amountCents,
    managementToken,
  }).returning();

  revalidateTag("bookings");
  revalidateTag("class-sessions");

  sendBookingConfirmationEmail({
    firstName: data.firstName,
    email: data.email,
    classType: session.classType,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    amountCents,
    bookingId: booking.id,
    managementToken,
  }).catch(() => {});

  sendAdminBookingNotificationEmail({
    firstName: data.firstName,
    lastName: data.lastName,
    classType: session.classType,
    date: session.date,
    startTime: session.startTime,
    amountCents,
  }).catch(() => {});

  sendTelegramBookingNotification({
    name: `${data.firstName} ${data.lastName}`,
    phone: data.phone,
    classType: session.classType,
    date: session.date,
    startTime: session.startTime,
    amountCents,
  }).catch(() => {});

  return { success: true, bookingId: booking.id, managementToken };
}

async function sendTelegramBookingNotification(data: {
  name: string; phone: string; classType: string; date: string; startTime: string; amountCents: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const dateFormatted = new Date(data.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const classLabel = CLASS_LABELS[data.classType] ?? data.classType;

  const lines = [
    `✅ <b>New PAID Booking — ${classLabel}</b>`,
    `<blockquote>`,
    `👤  <b>Name</b>\n     ${data.name}`,
    ``,
    `📱  <b>Phone</b>\n     ${data.phone}`,
    ``,
    `🗓  <b>Date</b>\n     ${dateFormatted} · ${data.startTime}`,
    ``,
    `💵  <b>Paid</b>\n     $${(data.amountCents / 100).toFixed(2)}`,
    `</blockquote>`,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "HTML" }),
  }).catch(() => {});
}
