"use server";

import { db } from "@/db";
import { schedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { z } from "zod";

const ScheduleRowSchema = z.object({
  classType:   z.enum(["twerk", "highheels", "stretching"]),
  dayOfWeek:   z.coerce.number().int().min(0).max(6),
  timeDisplay: z.string().min(1),
  duration:    z.string().min(1),
});

export async function updateSchedule(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  const parsed = ScheduleRowSchema.safeParse({
    classType:   formData.get("classType"),
    dayOfWeek:   formData.get("dayOfWeek"),
    timeDisplay: formData.get("timeDisplay"),
    duration:    formData.get("duration"),
  });

  if (!parsed.success) redirect("/admin/schedule");

  const { classType, dayOfWeek, timeDisplay, duration } = parsed.data;

  await db
    .update(schedules)
    .set({ dayOfWeek, timeDisplay, duration, updatedAt: new Date() })
    .where(eq(schedules.classType, classType));

  revalidateTag("schedule");
  redirect("/admin/schedule");
}
