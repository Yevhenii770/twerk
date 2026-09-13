import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySquareWebhookSignature } from "@/lib/square";
import { releaseSeat } from "@/lib/reserve";
import { revalidateTag } from "next/cache";
import { alertAdminError } from "@/lib/alerts";

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
      try {
        await reconcilePayment(payment.id, payment.status);
      } catch (error) {
        // Ack the webhook anyway (see below) instead of letting Square retry indefinitely on a
        // payload that will keep failing the same way — the alert is the visibility instead.
        await alertAdminError("square webhook reconcilePayment", error);
      }
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

  // A Square Payment object's own `status` never actually becomes "REFUNDED" — refunds are
  // tracked on a separate Refund object, and the original payment keeps reporting "COMPLETED"
  // forever after (Square just re-sends payment.updated whenever its refunded_money field
  // changes). Our own refund flow (lib/refund.ts) is the source of truth once a payment is
  // "refunded"/"refunding" — without this guard, that later "COMPLETED" echo regresses a
  // correctly-refunded payment straight back to "completed".
  if (paymentRow.status === "refunded" || paymentRow.status === "refunding") return;

  if (nextStatus === paymentRow.status) return;

  await db.update(payments).set({ status: nextStatus, updatedAt: new Date() }).where(eq(payments.id, paymentRow.id));

  // A Monthly Pass links several bookings to one payment — a refund/failure on the payment
  // (e.g. issued from the Square dashboard, bypassing our own refund flow) must reconcile every
  // linked booking, not just one, or the others are left "paid" against a payment that no
  // longer is.
  const bookingRows = await db.select().from(bookings).where(eq(bookings.paymentId, paymentRow.id));
  if (bookingRows.length === 0) return;

  if (nextStatus === "refunded") {
    for (const booking of bookingRows) {
      if (booking.status === "refunded") continue;
      await db.update(bookings).set({ status: "refunded" }).where(eq(bookings.id, booking.id));
      if (booking.sessionId) await releaseSeat(booking.sessionId);
    }
    revalidateTag("bookings");
  }

  if (nextStatus === "failed") {
    for (const booking of bookingRows) {
      if (booking.status !== "pending_payment") continue;
      await db.update(bookings).set({ status: "failed" }).where(eq(bookings.id, booking.id));
      if (booking.sessionId) await releaseSeat(booking.sessionId);
    }
    revalidateTag("bookings");
  }
}
