const STUDIO_TIMEZONE = "America/Los_Angeles";

/** Minutes to add to local wall-clock time to get UTC (e.g. -420 for PDT, -480 for PST),
 * read directly from Intl rather than round-tripping through the runtime's own default
 * timezone — the round-trip trick breaks silently when the runtime happens to already be
 * in the target zone (e.g. a developer's own machine), which is exactly the kind of bug
 * that "works locally" and fails nowhere obvious in review. */
function offsetMinutesAt(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" }).formatToParts(instant);
  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = raw.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + (hours < 0 ? -minutes : minutes);
}

/**
 * Converts a studio-local wall-clock date + time (as stored in class_sessions, e.g.
 * "2026-09-19" / "11:00") into the correct UTC instant, accounting for PDT/PST.
 *
 * This matters because the server runs in UTC (Vercel's default) while the studio's schedule
 * is always Portland local time. Naively parsing `${date}T${time}:00` (no zone suffix) gets
 * interpreted as the server's own zone, which is off by 7-8 hours from the real class start —
 * enough to shift a "24 hours before class" cutoff by most of a day.
 */
export function classStartUtc(date: string, time: string): Date {
  const guess = new Date(`${date}T${time}:00Z`);
  const offsetMinutes = offsetMinutesAt(guess, STUDIO_TIMEZONE);
  return new Date(guess.getTime() - offsetMinutes * 60_000);
}

/** Today's date ("YYYY-MM-DD") in Portland, not UTC. Using UTC made an evening class vanish from
 * booking around 4-5 PM local time, because UTC had already rolled over to tomorrow. */
export function studioTodayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: STUDIO_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Booking stays open through the class and this long after it ends, so students who came
 * without booking can pay at the studio (owner request 2026-11-26). */
export const BOOKING_CLOSES_AFTER_END_MIN = 30;

export function bookingClosesAt(s: { date: string; endTime: string }): Date {
  return new Date(classStartUtc(s.date, s.endTime).getTime() + BOOKING_CLOSES_AFTER_END_MIN * 60_000);
}

export function isBookingWindowOpen(s: { date: string; endTime: string }, now: number = Date.now()): boolean {
  return now < bookingClosesAt(s).getTime();
}

/** Class has started (or ended) but booking is still open — "pay at the studio" period. */
export function isInProgress(s: { date: string; startTime: string; endTime: string }, now: number = Date.now()): boolean {
  return now >= classStartUtc(s.date, s.startTime).getTime() && isBookingWindowOpen(s, now);
}
