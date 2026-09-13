import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySquareWebhookSignature } from "@/lib/square";
import { releaseSeat } from "@/lib/reserve";
import { revalidateTag } from "next/cache";

// Reconciliation safety net: our checkout action already confirms payment synchronously with
// Square before marking a booking "paid", so this webhook is defense-in-depth for cases where
// our server crashed mid-request after Square charged the card, or a refund/dispute happens
// later outside our own flow (e.g. from the Square dashboard).
// https://developer.squareup.com/docs/webhooks/step3validate
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-square-hmacsha256-signature");
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || req.url;

  const valid = verifySquareWebhookSignature({
    signatureHeader,
    requestBody: rawBody,
    notificationUrl,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: { object?: { payment?: { id?: string; status?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (payment?.id && payment.status) {
      await reconcilePayment(payment.id, payment.status);
    }
  }

  return NextResponse.json({ received: true });
}

async function reconcilePayment(squarePaymentId: string, squareStatus: string) {
  const rows = await db.select().from(payments).where(eq(payments.squarePaymentId, squarePaymentId)).limit(1);
  const paymentRow = rows[0];
  if (!paymentRow) return;

  const nextStatus = squareStatus === "COMPLETED" ? "completed"
    : squareStatus === "FAILED" || squareStatus === "CANCELED" ? "failed"
    : squareStatus === "REFUNDED" ? "refunded"
    : paymentRow.status;

  if (nextStatus === paymentRow.status) return;

  await db.update(payments).set({ status: nextStatus, updatedAt: new Date() }).where(eq(payments.id, paymentRow.id));

  const bookingRows = await db.select().from(bookings).where(eq(bookings.paymentId, paymentRow.id)).limit(1);
  const booking = bookingRows[0];
  if (!booking) return;

  if (nextStatus === "refunded" && booking.status !== "refunded") {
    await db.update(bookings).set({ status: "refunded" }).where(eq(bookings.id, booking.id));
    if (booking.sessionId) await releaseSeat(booking.sessionId);
    revalidateTag("bookings");
  }

  if (nextStatus === "failed" && booking.status === "pending_payment") {
    await db.update(bookings).set({ status: "failed" }).where(eq(bookings.id, booking.id));
    if (booking.sessionId) await releaseSeat(booking.sessionId);
    revalidateTag("bookings");
  }
}
