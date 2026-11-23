import { db } from "@/db";
import { closures, type Closure } from "@/db/schema";
import { asc, gte } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export type ClosureLike = Pick<Closure, "startDate" | "endDate" | "classType">;

/** True if a class on this date falls inside a closure ("YYYY-MM-DD" compares lexically). */
export function isClosed(classType: string, date: string, list: ClosureLike[]): boolean {
  return list.some(c => (c.classType == null || c.classType === classType) && c.startDate <= date && date <= c.endDate);
}

function fmt(d: string, withYear = false): string {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
}

/** "Dec 24" or "Dec 20 – Jan 3". */
export function formatRange(c: Pick<Closure, "startDate" | "endDate">): string {
  return c.startDate === c.endDate ? fmt(c.startDate) : `${fmt(c.startDate)} – ${fmt(c.endDate)}`;
}

const LABEL: Record<string, string> = { twerk: "Twerk", highheels: "High Heels" };

/** Customer-facing line: "No Twerk classes Dec 20 – Jan 3 — studio break." */
export function closureNotice(c: ClosureLike & { note?: string | null }): string {
  const what = c.classType ? `No ${LABEL[c.classType] ?? c.classType} classes` : "No classes";
  return `${what} ${formatRange(c)}${c.note ? ` (${c.note})` : ""}.`;
}

/** Closures that haven't ended yet, soonest first. */
export const getUpcomingClosures = unstable_cache(
  async () => {
    const today = new Date().toISOString().split("T")[0];
    return db.select().from(closures).where(gte(closures.endDate, today)).orderBy(asc(closures.startDate));
  },
  ["upcoming-closures"],
  { tags: ["closures"], revalidate: 300 }
);
