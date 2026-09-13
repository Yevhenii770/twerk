import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { verifySquareWebhookSignature } from "@/lib/square";

const KEY = "test-signature-key";
const URL = "https://bounce-lab.com/api/webhooks/square";

function sign(body: string): string {
  return crypto.createHmac("sha256", KEY).update(URL + body).digest("base64");
}

describe("verifySquareWebhookSignature", () => {
  const original = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  beforeEach(() => { process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = KEY; });
  afterEach(() => { process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = original; });

  it("accepts a correctly signed payload", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    const signature = sign(body);
    expect(verifySquareWebhookSignature({ signatureHeader: signature, requestBody: body, notificationUrl: URL })).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    const signature = sign(body);
    const tampered = JSON.stringify({ type: "payment.updated", amount: 999999 });
    expect(verifySquareWebhookSignature({ signatureHeader: signature, requestBody: tampered, notificationUrl: URL })).toBe(false);
  });

  it("rejects a missing signature header", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    expect(verifySquareWebhookSignature({ signatureHeader: null, requestBody: body, notificationUrl: URL })).toBe(false);
  });

  it("rejects when the signing key is not configured", () => {
    delete process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const body = JSON.stringify({ type: "payment.updated" });
    const signature = sign(body);
    expect(verifySquareWebhookSignature({ signatureHeader: signature, requestBody: body, notificationUrl: URL })).toBe(false);
  });

  it("rejects a signature computed with the wrong key", () => {
    const body = JSON.stringify({ type: "payment.updated" });
    const wrongSignature = crypto.createHmac("sha256", "wrong-key").update(URL + body).digest("base64");
    expect(verifySquareWebhookSignature({ signatureHeader: wrongSignature, requestBody: body, notificationUrl: URL })).toBe(false);
  });
});
