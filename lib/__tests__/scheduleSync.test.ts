import { describe, it, expect } from "vitest";
import { parseTimeRange, parseTimeDisplay, describeSchedule, classPrices, startingPrices } from "@/lib/classes";
import { findOffScheduleSessions, isoDayOfWeek } from "@/lib/sessions";
import { homeFaqs, CLASS_SEO } from "@/lib/seoContent";

// The schedule edited in the admin must flow to every place the site mentions it.
const schedule = [
  { classType: "twerk", dayOfWeek: 4, timeDisplay: "7:00 PM–8:00 PM", duration: "60 min" },
  { classType: "highheels", dayOfWeek: 5, timeDisplay: "7:00–8:00 PM", duration: "60 min" },
];

describe("parseTimeRange", () => {
  it("parses en dash, em dash and hyphen ranges", () => {
    expect(parseTimeRange("7:00–8:00 PM")).toEqual({ opens: "19:00", closes: "20:00" });
    expect(parseTimeRange("11:00 AM — 12:20 PM")).toEqual({ opens: "11:00", closes: "12:20" });
    expect(parseTimeRange("7:00 PM-8:00 PM")).toEqual({ opens: "19:00", closes: "20:00" });
  });
  it("returns null instead of throwing on bad input", () => {
    expect(parseTimeRange("7pm")).toBeNull();
    expect(parseTimeRange("evening")).toBeNull();
    expect(parseTimeRange("13:00–14:00 PM")).toBeNull();
    expect(parseTimeDisplay("7pm")).toEqual({ opens: "00:00", closes: "00:00" });
  });
});

describe("site copy follows the live schedule", () => {
  it("home FAQ uses the current days and times", () => {
    const text = homeFaqs(schedule, { dropin: 30, monthly: 100 }).map(f => f.a).join(" ");
    expect(text).toContain("Twerk (every Thursday, 7:00 PM–8:00 PM)");
    expect(text).toContain("High Heels (every Friday, 7:00–8:00 PM)");
    expect(text).not.toContain("Saturday");
  });
  it("home FAQ changes when the admin moves a class", () => {
    const moved = schedule.map(s => s.classType === "twerk" ? { ...s, dayOfWeek: 2, timeDisplay: "6:00–7:00 PM" } : s);
    expect(describeSchedule(moved)).toContain("Twerk (every Tuesday, 6:00–7:00 PM)");
  });
  it("class page FAQ uses the current slot and prices", () => {
    const faqs = CLASS_SEO.twerk.faqs(schedule[0], { dropin: 35, monthly: 120 }).map(f => f.a).join(" ");
    expect(faqs).toContain("every Thursday, 7:00 PM–8:00 PM");
    expect(faqs).toContain("$35");
    expect(faqs).toContain("$120");
  });
  it("prices prefer admin overrides", () => {
    expect(classPrices("twerk", { twerk: { dropinPrice: 25, monthlyPrice: null } })).toEqual({ dropin: 25, monthly: 100 });
    expect(startingPrices({ highheels: { dropinPrice: 20, monthlyPrice: 90 } })).toEqual({ dropin: 20, monthly: 90 });
  });
});

describe("booking follows the live schedule", () => {
  const sessions = [
    { id: 1, classType: "twerk", date: "2026-11-12", startTime: "19:00" }, // Thu 7 PM — current
    { id: 2, classType: "twerk", date: "2026-11-14", startTime: "11:00" }, // Sat 11 AM — old slot
    { id: 3, classType: "highheels", date: "2026-11-13", startTime: "19:00" }, // Fri 7 PM — current
    { id: 4, classType: "highheels", date: "2026-11-13", startTime: "18:00" }, // right day, old time
  ];
  it("computes weekday from ISO date regardless of timezone", () => {
    expect(isoDayOfWeek("2026-11-12")).toBe(4);
    expect(isoDayOfWeek("2026-11-14")).toBe(6);
  });
  it("flags sessions on an old day or old time", () => {
    expect(findOffScheduleSessions(sessions, schedule).map(s => s.id)).toEqual([2, 4]);
  });
  it("skips classes whose schedule text can't be parsed", () => {
    const broken = [{ ...schedule[0], timeDisplay: "evening" }, schedule[1]];
    expect(findOffScheduleSessions(sessions, broken).map(s => s.id)).toEqual([4]);
  });
});
