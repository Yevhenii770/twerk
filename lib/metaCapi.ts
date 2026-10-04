import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { purchaseEventId } from "@/lib/metaEventId";

const GRAPH_VERSION = "v21.0";

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const norm = (v: string) => v.trim().toLowerCase();

/**
 * Sends a Purchase to Meta's Conversions API. Server-side events survive ad blockers and
 * iOS tracking limits, which otherwise hide a large share of bookings from ad optimization.
 * No-op unless both NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_TOKEN are set. Never throws.
 */
export async function sendMetaPurchase(data: {
  bookingId: number;
  valueDollars: number;
  classType: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return;

  try {
    const hdrs = await headers();
    const jar = await cookies();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim();
    const phoneDigits = data.phone.replace(/\D/g, "");

    const event = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: purchaseEventId(data.bookingId),
      action_source: "website",
      event_source_url: hdrs.get("referer") || "https://bounce-lab.com/book",
      user_data: {
        em: [sha256(norm(data.email))],
        ph: phoneDigits ? [sha256(phoneDigits)] : undefined,
        fn: [sha256(norm(data.firstName))],
        ln: [sha256(norm(data.lastName))],
        country: [sha256("us")],
        client_ip_address: ip,
        client_user_agent: hdrs.get("user-agent") || undefined,
        fbp: jar.get("_fbp")?.value,
        fbc: jar.get("_fbc")?.value,
      },
      custom_data: {
        currency: "USD",
        value: data.valueDollars,
        content_name: data.classType,
        content_type: "product",
      },
    };

    const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
    await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event], ...(testCode ? { test_event_code: testCode } : {}) }),
    });
  } catch {
    // Tracking must never affect a paid booking.
  }
}
