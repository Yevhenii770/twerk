import { describe, it, expect } from "vitest";
import { classStartUtc } from "@/lib/studioTime";

describe("classStartUtc", () => {
  it("converts a PDT (summer) class time to the correct UTC instant", () => {
    // Sep 19 2026, 11:00 AM Portland time is PDT (UTC-7) -> 18:00 UTC.
    const result = classStartUtc("2026-09-19", "11:00");
    expect(result.toISOString()).toBe("2026-09-19T18:00:00.000Z");
  });

  it("converts a PST (winter) class time to the correct UTC instant", () => {
    // Jan 10 2026, 11:00 AM Portland time is PST (UTC-8) -> 19:00 UTC.
    const result = classStartUtc("2026-01-10", "11:00");
    expect(result.toISOString()).toBe("2026-01-10T19:00:00.000Z");
  });

  it("handles the DST spring-forward boundary correctly", () => {
    // 2026-03-08 is when Los Angeles springs forward to PDT. A class at 11:00 that morning
    // is already PDT (UTC-7), same as the Sep 19 case.
    const result = classStartUtc("2026-03-08", "11:00");
    expect(result.toISOString()).toBe("2026-03-08T18:00:00.000Z");
  });
});

import { studioTodayIso, isBookingWindowOpen, isInProgress } from "@/lib/studioTime";
import { isRefundEligible } from "@/lib/refundPolicy";

describe("booking window (open until 30 min after class ends)", () => {
  // Thu 2026-11-26 class 19:00-20:00 Portland (PST, UTC-8) → 03:00-04:00 UTC Fri
  const s = { date: "2026-11-26", startTime: "19:00", endTime: "20:00" };
  it("uses Portland's date, not UTC, in the evening", () => {
    expect(studioTodayIso(new Date("2026-11-27T02:00:00Z"))).toBe("2026-11-26");
  });
  it("is open before and during class, and up to 30 min after it ends", () => {
    expect(isBookingWindowOpen(s, Date.parse("2026-11-27T02:00:00Z"))).toBe(true);
    expect(isBookingWindowOpen(s, Date.parse("2026-11-27T03:30:00Z"))).toBe(true);
    expect(isBookingWindowOpen(s, Date.parse("2026-11-27T04:29:00Z"))).toBe(true);
    expect(isBookingWindowOpen(s, Date.parse("2026-11-27T04:30:00Z"))).toBe(false);
  });
  it("marks the class in progress only between start and close", () => {
    expect(isInProgress(s, Date.parse("2026-11-27T02:59:00Z"))).toBe(false);
    expect(isInProgress(s, Date.parse("2026-11-27T03:10:00Z"))).toBe(true);
    expect(isInProgress(s, Date.parse("2026-11-27T04:31:00Z"))).toBe(false);
  });
  it("no self-service refund for a payment made during class", () => {
    const now = new Date("2026-11-27T03:20:00Z");
    expect(isRefundEligible({ paidAt: new Date("2026-11-27T03:10:00Z"), classStart: new Date("2026-11-27T03:00:00Z"), now })).toBe(false);
  });
});

import { buildFollowup, whenAttended } from "@/lib/followupCopy";

describe("first-class follow-up email copy", () => {
  const base = {
    firstName: "Anna", classType: "twerk", address: "232 SE Oak St, Portland, OR 97214",
    attended: { date: "2026-11-26", startTime: "19:00" }, today: "2026-11-27", siteUrl: "https://bounce-lab.com",
  };
  it("same slot next week → 'Same time next Thursday?' with the real date, time, price and book link", () => {
    const { subject, html } = buildFollowup({ ...base, next: { id: 42, date: "2026-12-03", startTime: "19:00", endTime: "20:00", price: 30 } });
    expect(subject).toBe("Thanks for coming, Anna! Same time next Thursday?");
    expect(html).toContain("Twerk — Thu, Dec 3, 7:00 PM – 8:00 PM");
    expect(html).toContain("/book?session=42");
    expect(html).toContain("$30");
    expect(html).toContain("last night");
  });
  it("schedule changed → same email, with the new day and time from the schedule", () => {
    const { subject, html } = buildFollowup({ ...base, next: { id: 43, date: "2026-12-05", startTime: "11:00", endTime: "12:00", price: 30 } });
    expect(subject).toBe("Thanks for coming, Anna! Same time next Saturday?");
    expect(html).toContain("Sat, Dec 5, 11:00 AM – 12:00 PM");
  });
  it("cron ran late → 'on Thursday' instead of 'last night'", () => {
    expect(whenAttended({ date: "2026-11-26", startTime: "19:00" }, "2026-11-29")).toBe("on Thursday");
  });
});
