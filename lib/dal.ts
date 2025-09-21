"use server";

import { db } from "@/db";
import { getSession } from "./auth";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { calendarBookings, users } from "@/db/schema";
import { unstable_cacheTag as cacheTag } from "next/cache";
// import { ca } from "zod/locales";

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user;
  } catch (e) {
    console.error(e);
    return null;
  }
};
//Get current user
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));
    return result[0] || null;
  } catch (e) {
    console.error("Error getting user by ID:", e);
    return null;
  }
});

export async function getReservations(userId?: string) {
  "use cache";
  cacheTag("reservations");
  try {
    const result = await db.query.calendarBookings.findMany({
      where: userId ? eq(calendarBookings.userId, userId) : undefined,
      with: {
        user: true,
      },
      orderBy: (calendarBookings, { desc }) => [desc(calendarBookings.date)],
    });
    return result;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw new Error("Failed to fetch reservations");
  }
}
