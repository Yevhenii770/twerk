import crypto from "crypto";

/** Secure random token for the "Manage Booking" email link — not guessable, not sequential. */
export function generateManagementToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}
