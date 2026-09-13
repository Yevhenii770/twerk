import { describe, it, expect } from "vitest";
import { isRefundEligible, REFUND_GRACE_MINUTES, REFUND_CUTOFF_HOURS } from "@/lib/refundPolicy";

const NOW = new Date("2026-09-10T12:00:00.000Z");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);
const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 60 * 60_000);

describe("isRefundEligible", () => {
  it("allows a refund just inside the grace period, even with class imminent", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES - 1),
      classStart: hoursFromNow(1),
      now: NOW,
    })).toBe(true);
  });

  it("denies a refund right at the grace-period boundary once the class is also too close", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES),
      classStart: hoursFromNow(1),
      now: NOW,
    })).toBe(false);
  });

  it("allows a refund outside the grace period if the class is far enough out", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES + 60),
      classStart: hoursFromNow(REFUND_CUTOFF_HOURS + 1),
      now: NOW,
    })).toBe(true);
  });

  it("denies a refund right at the 24-hour boundary once the grace period has also passed", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES + 60),
      classStart: hoursFromNow(REFUND_CUTOFF_HOURS - 0.01),
      now: NOW,
    })).toBe(false);
  });

  it("allows a refund exactly at the 24-hour boundary (inclusive)", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES + 60),
      classStart: hoursFromNow(REFUND_CUTOFF_HOURS),
      now: NOW,
    })).toBe(true);
  });

  it("denies a refund once both windows have closed", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES + 60),
      classStart: hoursFromNow(1),
      now: NOW,
    })).toBe(false);
  });

  it("denies a refund for a class that already started or passed", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES + 60),
      classStart: hoursFromNow(-1),
      now: NOW,
    })).toBe(false);
  });

  it("treats a booking with no linked session as always far enough out", () => {
    expect(isRefundEligible({
      paidAt: minutesAgo(REFUND_GRACE_MINUTES + 60),
      classStart: null,
      now: NOW,
    })).toBe(true);
  });
});
