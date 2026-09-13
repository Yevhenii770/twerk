"use server";

import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { getSessionById, getUpcomingSessions, isSoldOut } from "@/lib/sessions";
import { claimSeat, releaseSeat } from "@/lib/reserve";
import { createSquarePayment } from "@/lib/square";
import { generateManagementToken } from "@/lib/token";
import {
  sendBookingConfirmationEmail,
  sendAdminBookingNotificationEmail,
  sendMonthlyPassConfirmationEmail,
  sendAdminMonthlyPassNotificationEmail,
} from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { CLASS_STATIC, MONTHLY_PASS_SESSION_COUNT, nextBookableSessions, type ClassId } from "@/lib/classes";
import { getClassSettings } from "@/lib/dal";
import crypto from "crypto";

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

  // A previous attempt with this idempotency key may have failed (e.g. card declined) — reuse
  // that row instead of inserting a new one, which would violate the unique key constraint.
  const [paymentRow] = existingPayment[0]
    ? await db.update(payments)
        .set({ status: "pending", amountCents, squarePaymentId: null, squareOrderId: null, updatedAt: new Date() })
        .where(eq(payments.id, existingPayment[0].id))
        .returning()
    : await db.insert(payments).values({
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

const MonthlyCheckoutSchema = z.object({
  classType: z.enum(["twerk", "highheels"]),
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().regex(/^[\d\s\-+()]{10,}$/, "Enter a valid phone number"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  sourceId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
});

export type MonthlyCheckoutInput = z.infer<typeof MonthlyCheckoutSchema>;

/**
 * Buys a Monthly Pass: one Square charge for the flat monthly price, claiming the next
 * MONTHLY_PASS_SESSION_COUNT bookable sessions of the chosen class up front (same
 * nextBookableSessions rule the client used to preview the dates, so what was shown is what
 * gets booked — re-run server-side since the client's snapshot could be a few minutes stale).
 * The resulting bookings share one `bookingGroupId` and one `paymentId`; refundBookingPayment
 * treats that shared paymentId as the unit of refund, so cancelling any one of them refunds and
 * releases the whole pass rather than just a single date.
 */
export async function createPaidMonthlyBooking(input: MonthlyCheckoutInput): Promise<CheckoutResult> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000)) {
    return { success: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = MonthlyCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid booking details" };
  }
  const data = parsed.data;
  const classType = data.classType as ClassId;
  const classInfo = CLASS_STATIC[classType];
  const classSettings = await getClassSettings();
  const monthlyPrice = classSettings[classType]?.monthlyPrice ?? classInfo.monthly;
  if (!monthlyPrice) return { success: false, error: "Monthly Pass isn't available for this class." };

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

  const allUpcoming = await getUpcomingSessions();
  const picks = nextBookableSessions(allUpcoming.filter((s) => s.classType === classType), MONTHLY_PASS_SESSION_COUNT);
  if (picks.length < MONTHLY_PASS_SESSION_COUNT) {
    return { success: false, error: "Not enough upcoming classes are open right now for a Monthly Pass. Please contact us." };
  }

  const claimedIds: number[] = [];
  for (const s of picks) {
    const ok = await claimSeat(s.id);
    if (!ok) {
      for (const id of claimedIds) await releaseSeat(id);
      return { success: false, error: "Sorry, one of these classes just sold out. Please try again." };
    }
    claimedIds.push(s.id);
  }

  const amountCents = monthlyPrice * 100;

  const [paymentRow] = existingPayment[0]
    ? await db.update(payments)
        .set({ status: "pending", amountCents, squarePaymentId: null, squareOrderId: null, updatedAt: new Date() })
        .where(eq(payments.id, existingPayment[0].id))
        .returning()
    : await db.insert(payments).values({
        idempotencyKey: data.idempotencyKey,
        amountCents,
        status: "pending",
      }).returning();

  const paymentResult = await createSquarePayment({
    sourceId: data.sourceId,
    idempotencyKey: data.idempotencyKey,
    amountCents,
    buyerEmail: data.email,
    note: `${CLASS_LABELS[classType] ?? classType} — Monthly Pass (${picks.length} classes)`,
  });

  if (!paymentResult.ok) {
    for (const id of claimedIds) await releaseSeat(id);
    await db.update(payments).set({ status: "failed", updatedAt: new Date() }).where(eq(payments.id, paymentRow.id));
    return { success: false, error: paymentResult.error || "Payment failed. Please check your card details and try again." };
  }

  await db.update(payments).set({
    status: "completed",
    squarePaymentId: paymentResult.paymentId,
    squareOrderId: paymentResult.orderId,
    updatedAt: new Date(),
  }).where(eq(payments.id, paymentRow.id));

  const bookingGroupId = crypto.randomUUID();
  const perSessionCents = Math.round(amountCents / picks.length);

  const inserted = await db.insert(bookings).values(
    picks.map((s) => ({
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      notes: data.notes || null,
      classType: s.classType,
      bookingType: "monthly",
      date: s.date,
      price: Math.round(perSessionCents / 100),
      status: "paid",
      sessionId: s.id,
      paymentId: paymentRow.id,
      amountPaidCents: perSessionCents,
      bookingGroupId,
      managementToken: generateManagementToken(),
    }))
  ).returning();

  revalidateTag("bookings");
  revalidateTag("class-sessions");

  const primary = inserted[0];

  sendMonthlyPassConfirmationEmail({
    firstName: data.firstName,
    email: data.email,
    classType,
    sessions: picks,
    amountCents,
    bookingId: primary.id,
    managementToken: primary.managementToken!,
  }).catch(() => {});

  sendAdminMonthlyPassNotificationEmail({
    firstName: data.firstName,
    lastName: data.lastName,
    classType,
    sessions: picks,
    amountCents,
  }).catch(() => {});

  sendTelegramMonthlyPassNotification({
    name: `${data.firstName} ${data.lastName}`,
    phone: data.phone,
    classType,
    sessions: picks,
    amountCents,
  }).catch(() => {});

  return { success: true, bookingId: primary.id, managementToken: primary.managementToken! };
}

async function sendTelegramMonthlyPassNotification(data: {
  name: string; phone: string; classType: string; sessions: { date: string; startTime: string }[]; amountCents: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const classLabel = CLASS_LABELS[data.classType] ?? data.classType;
  const dateList = data.sessions
    .map((s) => new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + ` · ${s.startTime}`)
    .join("\n     ");

  const lines = [
    `✅ <b>New PAID Monthly Pass — ${classLabel}</b>`,
    `<blockquote>`,
    `👤  <b>Name</b>\n     ${data.name}`,
    ``,
    `📱  <b>Phone</b>\n     ${data.phone}`,
    ``,
    `🗓  <b>${data.sessions.length} Classes</b>\n     ${dateList}`,
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
