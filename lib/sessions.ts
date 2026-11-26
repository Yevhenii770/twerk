import { db } from "@/db";
import { classSessions, schedules } from "@/db/schema";
import { and, asc, eq, gte } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { CLASS_STATIC, parseTimeRange, type ClassId } from "@/lib/classes";
import { getClassSettings } from "@/lib/dal";
import { getUpcomingClosures, isClosed } from "@/lib/closures";
import { studioTodayIso, isBookingWindowOpen } from "@/lib/studioTime";

const WEEKS_AHEAD = 8;

function todayIso(): string {
  return studioTodayIso();
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
  const [sched, classSettings, closureList] = await Promise.all([db.select().from(schedules), getClassSettings(), getUpcomingClosures()]);

  // One bulk INSERT … ON CONFLICT DO NOTHING instead of one round trip per date: this runs on
  // every /book view, and ~16 sequential HTTP queries to Neon made the page wait ~1.3s.
  const rows: (typeof classSessions.$inferInsert)[] = []
  for (const s of sched) {
    const info = CLASS_STATIC[s.classType as ClassId];
    if (!info) continue;
    const range = parseTimeRange(s.timeDisplay);
    if (!range) continue; // unparseable admin input — never generate bogus 00:00 sessions
    const { opens, closes } = range;
    const dropinPrice = classSettings[s.classType]?.dropinPrice ?? info.dropin;
    for (const date of nextOccurrences(s.dayOfWeek, WEEKS_AHEAD)) {
      // A date inside a vacation/holiday closure is created already cancelled, so it never
      // becomes bookable — even when the closure was set months before the date is generated.
      const closed = isClosed(s.classType, date, closureList);
      rows.push({
        classType: s.classType,
        date,
        startTime: opens,
        endTime: closes,
        price: dropinPrice,
        capacity: DEFAULT_CAPACITY[s.classType] ?? 15,
        ...(closed ? { cancelled: true, bookingOpen: false } : {}),
      });
    }
  }
  if (rows.length) {
    await db
      .insert(classSessions)
      .values(rows)
      .onConflictDoNothing({ target: [classSessions.classType, classSessions.date, classSessions.startTime] });
  }
}

// Kept in sync with what the studio set at setup time; editable per-session in the admin.
const DEFAULT_CAPACITY: Record<string, number> = {
  twerk: 15,
  highheels: 15,
};

const getUpcomingSessionsCached = unstable_cache(
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

/** Upcoming sessions still open for booking: today's class stays listed until
 * BOOKING_CLOSES_AFTER_END_MIN after it ends (filtered after the cache, so it's exact). */
export async function getUpcomingSessions() {
  const now = Date.now();
  return (await getUpcomingSessionsCached()).filter((s) => isBookingWindowOpen(s, now));
}

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

type SlotLike = { classType: string; date: string; startTime: string };

/** Day of week (0=Sun) of a "YYYY-MM-DD" date, timezone-independent. */
export function isoDayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Sessions that no longer match their class's current weekly slot (e.g. left over after the
 * admin moved Twerk from Saturday 11 AM to Thursday 7 PM). Classes whose schedule text can't be
 * parsed are skipped rather than treating every session as stale. */
export function findOffScheduleSessions<T extends SlotLike>(
  sessions: T[],
  schedule: { classType: string; dayOfWeek: number; timeDisplay: string }[],
): T[] {
  const slots = new Map<string, { dayOfWeek: number; opens: string }>();
  for (const s of schedule) {
    const range = parseTimeRange(s.timeDisplay);
    if (range) slots.set(s.classType, { dayOfWeek: s.dayOfWeek, opens: range.opens });
  }
  return sessions.filter(s => {
    const slot = slots.get(s.classType);
    if (!slot) return false;
    return isoDayOfWeek(s.date) !== slot.dayOfWeek || s.startTime !== slot.opens;
  });
}

/** Upcoming, not-cancelled sessions sitting outside the current schedule (uncached — admin only). */
export async function getOffScheduleSessions() {
  const [sched, upcoming] = await Promise.all([
    db.select().from(schedules),
    db.select().from(classSessions)
      .where(and(gte(classSessions.date, todayIso()), eq(classSessions.cancelled, false)))
      .orderBy(asc(classSessions.date), asc(classSessions.startTime)),
  ]);
  return findOffScheduleSessions(upcoming, sched);
}
