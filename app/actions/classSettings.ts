"use server";

import { db } from "@/db";
import { classSettings } from "@/db/schema";
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
