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
