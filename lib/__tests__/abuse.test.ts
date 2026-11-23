import { describe, it, expect } from "vitest";
import { normEmail, normPhone, LIMITS } from "@/lib/abuse";

describe("anti-abuse helpers", () => {
  it("normalizes email and phone so small variations count as the same person", () => {
    expect(normEmail("  Jane@Mail.COM ")).toBe("jane@mail.com");
    expect(normPhone("+1 (503) 555-0100")).toBe("5035550100");
    expect(normPhone("503.555.0100")).toBe("5035550100");
  });
  it("limits stay friendly for real students", () => {
    expect(LIMITS.autoRefundsPer30Days).toBeGreaterThanOrEqual(2);
    expect(LIMITS.seatsPerSession).toBeGreaterThanOrEqual(2);
    expect(LIMITS.declinesPerHourNoCaptcha).toBeGreaterThanOrEqual(2);
  });
});
