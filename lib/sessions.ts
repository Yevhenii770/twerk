import { db } from "@/db";
import { classSessions, schedules } from "@/db/schema";
import { and, asc, eq, gte } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { CLASS_STATIC, type ClassId } from "@/lib/classes";

const WEEKS_AHEAD = 8;

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function nextOccurrences(dayOfWeek: number, count: number): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (dates.length < count) {
    if (d.getDay() === dayOfWeek) dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/**
 * Ensures the next WEEKS_AHEAD occurrences of each recurring class exist as bookable
 * class_sessions rows. Idempotent (unique class_type+date+start_time constraint) so it's
 * safe to call on every booking-page load instead of requiring manual admin work.
 *
 * Deliberately does NOT call revalidateTag — this runs inside a Server Component render
 * (the /book page), and revalidateTag is only legal from a Server Action or Route Handler;
 * calling it here breaks static generation entirely ("used revalidateTag during render").
 * getUpcomingSessions() below carries a short time-based revalidate instead, so newly
 * generated sessions become visible without needing a render-time tag invalidation.
 */
export async function ensureUpcomingSessions(): Promise<void> {
  const sched = await db.select().from(schedules);

  for (const s of sched) {
    const info = CLASS_STATIC[s.classType as ClassId];
    if (!info) continue;
    const { opens, closes } = parseTimeDisplay(s.timeDisplay);
    const dates = nextOccurrences(s.dayOfWeek, WEEKS_AHEAD);

    for (const date of dates) {
      await db
        .insert(classSessions)
        .values({
          classType: s.classType,
          date,
          startTime: opens,
          endTime: closes,
          price: info.dropin,
          capacity: DEFAULT_CAPACITY[s.classType] ?? 15,
        })
        .onConflictDoNothing({ target: [classSessions.classType, classSessions.date, classSessions.startTime] });
    }
  }
}

// Kept in sync with what the studio set at setup time; editable per-session in the admin.
const DEFAULT_CAPACITY: Record<string, number> = {
  twerk: 15,
  highheels: 15,
};

// Duplicated (trimmed) copy of lib/classes.ts#parseTimeDisplay to avoid a client/server import
// boundary headache — kept intentionally tiny and pure.
function parseTimeDisplay(timeDisplay: string): { opens: string; closes: string } {
  const parts = timeDisplay.split(/[–—-]/);
  const endPart = parts[1]?.trim() ?? "";
  const startPart = parts[0]?.trim() ?? "";
  const endMatch = endPart.match(/(\d+):(\d+)\s*(AM|PM)/i);
  const startMatch = startPart.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
  if (!endMatch || !startMatch) return { opens: "00:00", closes: "00:00" };
  const endPeriod = endMatch[3].toUpperCase() as "AM" | "PM";
  const startPeriod = (startMatch[3]?.toUpperCase() ?? endPeriod) as "AM" | "PM";
  const to24 = (h: string, m: string, p: "AM" | "PM") => {
    let hour = parseInt(h);
    if (p === "PM" && hour !== 12) hour += 12;
    if (p === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${m}`;
  };
  return {
    opens: to24(startMatch[1], startMatch[2], startPeriod),
    closes: to24(endMatch[1], endMatch[2], endPeriod),
  };
}

export const getUpcomingSessions = unstable_cache(
  async () => {
    const today = todayIso();
    return db
      .select()
      .from(classSessions)
      .where(and(gte(classSessions.date, today), eq(classSessions.cancelled, false)))
      .orderBy(asc(classSessions.date), asc(classSessions.startTime));
  },
  ["upcoming-class-sessions"],
  { tags: ["class-sessions"], revalidate: 60 }
);

export async function getSessionById(id: number) {
  const rows = await db.select().from(classSessions).where(eq(classSessions.id, id)).limit(1);
  return rows[0] ?? null;
}

export function remainingSeats(session: { capacity: number; booked: number }): number {
  return Math.max(0, session.capacity - session.booked);
}

export function isSoldOut(session: { capacity: number; booked: number; bookingOpen: boolean; cancelled: boolean }): boolean {
  return session.cancelled || !session.bookingOpen || remainingSeats(session) <= 0;
}
