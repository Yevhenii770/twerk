import { describe, it, expect } from "vitest";
import { classAddress, postalAddress, MAIN_ADDRESS, DEFAULT_CLASS_ADDRESS } from "@/lib/studio";
import { whereSentence, CLASS_SEO } from "@/lib/seoContent";

describe("per-class studio address", () => {
  it("defaults: Twerk at Oak, Heels at Burnside; main address = Google Maps pin", () => {
    expect(classAddress("twerk")).toContain("232 SE Oak St");
    expect(classAddress("highheels")).toContain("2648 E Burnside St");
    expect(MAIN_ADDRESS).toBe(DEFAULT_CLASS_ADDRESS.highheels);
  });

  it("admin value wins, blank falls back", () => {
    expect(classAddress("twerk", { twerk: { address: "1 New St, Portland, OR 97201" } })).toBe("1 New St, Portland, OR 97201");
    expect(classAddress("twerk", { twerk: { address: "  " } })).toBe(DEFAULT_CLASS_ADDRESS.twerk);
  });

  it("parses a postal address for schema", () => {
    expect(postalAddress("2648 E Burnside St, Portland, OR 97214")).toMatchObject({
      streetAddress: "2648 E Burnside St", addressLocality: "Portland", addressRegion: "OR", postalCode: "97214",
    });
  });

  it("FAQ copy follows the class's own address", () => {
    const both = whereSentence({ twerk: "A St, Portland, OR 97214", highheels: "B St, Portland, OR 97214" });
    expect(both).toContain("Twerk classes are at A St");
    expect(both).toContain("High Heels classes are at B St");
    const heels = CLASS_SEO.highheels.faqs(undefined, { dropin: 30, monthly: null }, "B St, Portland, OR 97214").map(f => f.a).join(" ");
    expect(heels).toContain("B St");
  });
});

import { isClosed, closureNotice, formatRange } from "@/lib/closures";

describe("closures (vacation)", () => {
  const list = [
    { startDate: "2026-12-20", endDate: "2027-01-03", classType: null },
    { startDate: "2026-12-04", endDate: "2026-12-04", classType: "highheels" },
  ];
  it("closes every class inside an all-classes range, inclusive", () => {
    expect(isClosed("twerk", "2026-12-20", list)).toBe(true);
    expect(isClosed("highheels", "2027-01-03", list)).toBe(true);
    expect(isClosed("twerk", "2027-01-04", list)).toBe(false);
  });
  it("a class-specific day closes only that class", () => {
    expect(isClosed("highheels", "2026-12-04", list)).toBe(true);
    expect(isClosed("twerk", "2026-12-04", list)).toBe(false);
  });
  it("formats a customer notice", () => {
    expect(formatRange(list[0])).toBe("Dec 20 – Jan 3");
    expect(closureNotice({ ...list[1], note: "holiday" })).toBe("No High Heels classes Dec 4 (holiday).");
  });
});
