// Client-safe Square constants only — never import lib/square.ts (server secrets) from
// a client component.
const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENV === "production" ? "production" : "sandbox";

export function squareWebPaymentsSdkUrl(): string {
  return SQUARE_ENV === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";
}

export function squareApplicationId(): string {
  return process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
}

export function squareLocationIdPublic(): string {
  return process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
}
