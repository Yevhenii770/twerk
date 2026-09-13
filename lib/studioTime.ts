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
