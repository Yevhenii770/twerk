"use server";

import { db } from "@/db";
import { classSettings, classSessions } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export async function updatePhotoPosition(classType: string, photoPosition: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  await db
    .insert(classSettings)
    .values({ classType, photoPosition })
    .onConflictDoUpdate({
      target: classSettings.classType,
      set: { photoPosition, updatedAt: new Date() },
    });

  revalidateTag("class-settings");
}

export async function updateClassText(classType: string, desc: string, modalTexts: string[]) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  await db
    .insert(classSettings)
    .values({ classType, desc, modalTexts: JSON.stringify(modalTexts), photoPosition: "50% 50%" })
    .onConflictDoUpdate({
      target: classSettings.classType,
      set: { desc, modalTexts: JSON.stringify(modalTexts), updatedAt: new Date() },
    });

  revalidateTag("class-settings");
}

/**
 * Sets the standard Drop-in price for a class: stored as the default for future auto-generated
 * sessions (ensureUpcomingSessions), and applied immediately to every currently upcoming,
 * non-cancelled session of that class so the change takes effect right away rather than only
 * once the current ~8-week window of already-generated dates rolls past. An admin can still
 * override a single date afterward via that session's own "Edit Price" in the roster below.
 */
export async function updateDropinPrice(classType: string, dropinPrice: number) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");
  if (!Number.isInteger(dropinPrice) || dropinPrice < 0 || dropinPrice > 10000) {
    return { success: false, error: "Invalid price" };
  }

  await db
    .insert(classSettings)
    .values({ classType, dropinPrice, photoPosition: "50% 50%" })
    .onConflictDoUpdate({
      target: classSettings.classType,
      set: { dropinPrice, updatedAt: new Date() },
    });

  const today = new Date().toISOString().split("T")[0];
  await db
    .update(classSessions)
    .set({ price: dropinPrice, updatedAt: new Date() })
    .where(and(eq(classSessions.classType, classType), eq(classSessions.cancelled, false), gte(classSessions.date, today)));

  revalidateTag("class-settings");
  revalidateTag("class-sessions");
  return { success: true };
}

export async function updateMonthlyPrice(classType: string, monthlyPrice: number) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");
  if (!Number.isInteger(monthlyPrice) || monthlyPrice < 0 || monthlyPrice > 10000) {
    return { success: false, error: "Invalid price" };
  }

  await db
    .insert(classSettings)
    .values({ classType, monthlyPrice, photoPosition: "50% 50%" })
    .onConflictDoUpdate({
      target: classSettings.classType,
      set: { monthlyPrice, updatedAt: new Date() },
    });

  revalidateTag("class-settings");
  return { success: true };
}

export async function updatePhotoUrl(classType: string, photoUrl: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  await db
    .insert(classSettings)
    .values({ classType, photoUrl, photoPosition: "50% 50%" })
    .onConflictDoUpdate({
      target: classSettings.classType,
      set: { photoUrl, updatedAt: new Date() },
    });

  revalidateTag("class-settings");
}
