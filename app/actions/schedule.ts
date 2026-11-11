"use server";

import { db } from "@/db";
import { classSessions, schedules } from "@/db/schema";
import { and, eq, gte, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { parseTimeRange } from "@/lib/classes";
import { ensureUpcomingSessions, findOffScheduleSessions } from "@/lib/sessions";
import { z } from "zod";

const ScheduleRowSchema = z.object({
  classType:   z.enum(["twerk", "highheels"]),
  dayOfWeek:   z.coerce.number().int().min(0).max(6),
  timeDisplay: z.string().trim().min(1),
  duration:    z.string().trim().min(1),
});

/**
 * Saves a class's weekly slot and makes the change take effect everywhere:
 *  - every page reads the schedule through getSchedule() (tag "schedule"), so the site text,
 *    footer, calendar, class pages, FAQ and structured data all update on the next request;
 *  - already-generated sessions at the OLD slot are taken off the booking page: empty ones are
 *    cancelled, ones that already have students are closed to new bookings and listed on the
 *    schedule admin page so the studio can contact those students; new-slot sessions for the
 *    next 8 weeks are generated immediately.
 */
export async function updateSchedule(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  const parsed = ScheduleRowSchema.safeParse({
    classType:   formData.get("classType"),
    dayOfWeek:   formData.get("dayOfWeek"),
    timeDisplay: formData.get("timeDisplay"),
    duration:    formData.get("duration"),
  });

  if (!parsed.success) redirect("/admin/schedule?error=invalid");

  const { classType, dayOfWeek, timeDisplay, duration } = parsed.data;

  // Reject times the booking system can't turn into real sessions (e.g. "7pm", "evening").
  if (!parseTimeRange(timeDisplay)) redirect(`/admin/schedule?error=time&class=${classType}`);

  const [previous] = await db.select().from(schedules).where(eq(schedules.classType, classType));
  const slotChanged = !previous
    || previous.dayOfWeek !== dayOfWeek
    || parseTimeRange(previous.timeDisplay)?.opens !== parseTimeRange(timeDisplay)?.opens;

  await db
    .update(schedules)
    .set({ dayOfWeek, timeDisplay, duration, updatedAt: new Date() })
    .where(eq(schedules.classType, classType));

  const today = new Date().toISOString().split("T")[0];
  const allUpcoming = await db
    .select()
    .from(classSessions)
    .where(and(eq(classSessions.classType, classType), gte(classSessions.date, today)));
  const upcoming = allUpcoming.filter(s => !s.cancelled);

  // Moving back to a slot used before: sessions that were auto-cancelled when the class moved
  // away from it would otherwise block regeneration (unique class+date+time) and stay cancelled.
  if (slotChanged) {
    const offSlot = new Set(findOffScheduleSessions(allUpcoming, [{ classType, dayOfWeek, timeDisplay }]).map(s => s.id));
    const reopenIds = allUpcoming.filter(s => s.cancelled && s.booked === 0 && !offSlot.has(s.id)).map(s => s.id);
    if (reopenIds.length) {
      await db.update(classSessions)
        .set({ cancelled: false, bookingOpen: true, updatedAt: new Date() })
        .where(inArray(classSessions.id, reopenIds));
    }
  }

  const stale = findOffScheduleSessions(upcoming, [{ classType, dayOfWeek, timeDisplay }]);
  const emptyIds = stale.filter(s => s.booked === 0).map(s => s.id);
  const bookedIds = stale.filter(s => s.booked > 0).map(s => s.id);

  if (emptyIds.length) {
    await db.update(classSessions)
      .set({ cancelled: true, bookingOpen: false, updatedAt: new Date() })
      .where(inArray(classSessions.id, emptyIds));
  }
  if (bookedIds.length) {
    await db.update(classSessions)
      .set({ bookingOpen: false, updatedAt: new Date() })
      .where(inArray(classSessions.id, bookedIds));
  }

  // Create the new-slot sessions right away, so /book offers the new day/time immediately.
  await ensureUpcomingSessions();

  revalidateTag("schedule");
  revalidateTag("class-sessions");
  redirect(`/admin/schedule?saved=${classType}&cancelled=${emptyIds.length}&closed=${bookedIds.length}`);
}
