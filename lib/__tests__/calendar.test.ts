import { describe, it, expect } from "vitest";
import { buildGoogleCalendarUrl, buildIcsFile } from "@/lib/calendar";

describe("buildGoogleCalendarUrl", () => {
  it("encodes date/time range and location", () => {
    const url = buildGoogleCalendarUrl({
      title: "Twerk @ bounce lab",
      date: "2026-09-04",
      startTime: "18:00",
      endTime: "19:00",
      details: "details",
    });
    expect(url).toContain("dates=20260904T180000%2F20260904T190000");
    expect(url).toContain("action=TEMPLATE");
  });
});

describe("buildIcsFile", () => {
  it("produces a well-formed VEVENT block", () => {
    const ics = buildIcsFile({
      uid: "booking-1",
      title: "Twerk @ bounce lab",
      date: "2026-09-04",
      startTime: "18:00",
      endTime: "19:00",
      details: "Booked via bounce-lab.com",
    });
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20260904T180000");
    expect(ics).toContain("DTEND:20260904T190000");
    expect(ics).toContain("SUMMARY:Twerk @ bounce lab");
    expect(ics).toContain("END:VEVENT");
  });

  it("escapes special characters", () => {
    const ics = buildIcsFile({
      uid: "booking-2",
      title: "Class; with, special\ncharacters",
      date: "2026-09-04",
      startTime: "18:00",
      endTime: "19:00",
      details: "",
    });
    expect(ics).toContain("Class\\; with\\, special\\ncharacters");
  });
});
