import crypto from "crypto";

// Talks to Square's REST API directly (no SDK dependency) — see
// https://developer.squareup.com/reference/square/payments-api/create-payment
// SQUARE_ENV controls both the API host and which Web Payments SDK script the client loads.
const SQUARE_ENV = process.env.SQUARE_ENV === "production" ? "production" : "sandbox";

const API_BASE = SQUARE_ENV === "production"
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";

const SQUARE_VERSION = "2024-10-17";

function accessToken(): string {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not configured");
  return token;
}

function locationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) throw new Error("SQUARE_LOCATION_ID is not configured");
  return id;
}

export type CreatePaymentResult =
  | { ok: true; paymentId: string; orderId?: string; status: string; receiptUrl?: string }
  | { ok: false; error: string };

/**
 * Charges a Square payment token (sourceId, from the client-side Web Payments SDK — the raw
 * card number never touches our server). idempotencyKey must be stable across retries of the
 * same checkout attempt so a double-click/page reload can't double-charge the customer.
 */
export async function createSquarePayment(params: {
  sourceId: string;
  idempotencyKey: string;
  amountCents: number;
  currency?: string;
  buyerEmail?: string;
  note?: string;
}): Promise<CreatePaymentResult> {
  try {
    const res = await fetch(`${API_BASE}/v2/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${accessToken()}`,
      },
      body: JSON.stringify({
        source_id: params.sourceId,
        idempotency_key: params.idempotencyKey,
        amount_money: { amount: params.amountCents, currency: params.currency ?? "USD" },
        location_id: locationId(),
        autocomplete: true,
        buyer_email_address: params.buyerEmail,
        note: params.note,
      }),
    });

    const body = await res.json();

    if (!res.ok) {
      const message = body?.errors?.[0]?.detail || `Square payment failed (HTTP ${res.status})`;
      return { ok: false, error: message };
    }

    const payment = body.payment;
    return {
      ok: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      status: payment.status,
      receiptUrl: payment.receipt_url,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unexpected payment error" };
  }
}

export async function getSquarePayment(paymentId: string): Promise<{ status: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/v2/payments/${paymentId}`, {
      headers: {
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${accessToken()}`,
      },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return { status: body.payment?.status };
  } catch {
    return null;
  }
}

export async function refundSquarePayment(params: {
  paymentId: string;
  amountCents: number;
  idempotencyKey: string;
  reason?: string;
}): Promise<{ ok: true; refundId: string; status: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/v2/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${accessToken()}`,
      },
      body: JSON.stringify({
        idempotency_key: params.idempotencyKey,
        payment_id: params.paymentId,
        amount_money: { amount: params.amountCents, currency: "USD" },
        reason: params.reason,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      return { ok: false, error: body?.errors?.[0]?.detail || `Refund failed (HTTP ${res.status})` };
    }
    return { ok: true, refundId: body.refund.id, status: body.refund.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unexpected refund error" };
  }
}

/**
 * Verifies a Square webhook's HMAC-SHA256 signature.
 * https://developer.squareup.com/docs/webhooks/step3validate
 */
export function verifySquareWebhookSignature(params: {
  signatureHeader: string | null;
  requestBody: string;
  notificationUrl: string;
}): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey || !params.signatureHeader) return false;

  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(params.notificationUrl + params.requestBody);
  const expected = hmac.digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(params.signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
