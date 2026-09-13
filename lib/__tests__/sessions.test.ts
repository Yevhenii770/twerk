import { describe, it, expect } from "vitest";
import { remainingSeats, isSoldOut } from "@/lib/sessions";

describe("remainingSeats", () => {
  it("computes capacity minus booked", () => {
    expect(remainingSeats({ capacity: 15, booked: 8 })).toBe(7);
  });
  it("never goes negative", () => {
    expect(remainingSeats({ capacity: 15, booked: 20 })).toBe(0);
  });
});

describe("isSoldOut", () => {
  const base = { capacity: 15, booked: 0, bookingOpen: true, cancelled: false };

  it("is not sold out with open seats", () => {
    expect(isSoldOut({ ...base, booked: 5 })).toBe(false);
  });
  it("is sold out when booked reaches capacity", () => {
    expect(isSoldOut({ ...base, booked: 15 })).toBe(true);
  });
  it("is sold out when booking is closed even with open seats", () => {
    expect(isSoldOut({ ...base, booked: 0, bookingOpen: false })).toBe(true);
  });
  it("is sold out when cancelled even with open seats", () => {
    expect(isSoldOut({ ...base, booked: 0, cancelled: true })).toBe(true);
  });
});
