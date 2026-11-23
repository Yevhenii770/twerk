import { getUpcomingSessions, findOffScheduleSessions, isSoldOut } from '@/lib/sessions'
import { getSchedule } from '@/lib/dal'
import { classStartUtc } from '@/lib/studioTime'
import { CLASS_IDS, type ClassId } from '@/lib/classes'
import type { ClassSession } from '@/db/schema'

/** The soonest session per class someone can actually book right now (open, has seats, not
 * started yet, not a retired off-schedule slot). Drives the "Next class → Book" shortcuts. */
export async function getNextBookable(): Promise<Partial<Record<ClassId, ClassSession>>> {
  const [sessions, schedule] = await Promise.all([getUpcomingSessions(), getSchedule()])
  const retired = new Set(findOffScheduleSessions(sessions, schedule).map(s => s.id))
  const now = Date.now()
  const out: Partial<Record<ClassId, ClassSession>> = {}
  for (const id of CLASS_IDS) {
    out[id] = sessions.find(s =>
      s.classType === id && !retired.has(s.id) && !isSoldOut(s) && classStartUtc(s.date, s.startTime).getTime() > now)
  }
  return out
}

export { fmtShortDate, fmtClock, whenLabel, TRUST_LINE } from '@/lib/nextFormat'
