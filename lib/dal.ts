"use server";

import { db } from "@/db";
import { getSession } from "./auth";
import { eq, desc } from "drizzle-orm";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { bookings, users } from "@/db/schema";

export const getUserByEmail = async (email: string) => {
  try {
    return await db.query.users.findFirst({ where: eq(users.email, email) });
  } catch {
    return null;
  }
};

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  try {
    const result = await db.select().from(users).where(eq(users.id, session.userId));
    return result[0] || null;
  } catch {
    return null;
  }
});

export const getAllBookings = unstable_cache(
  async () => db.select().from(bookings).orderBy(desc(bookings.date)),
  ["all-bookings"],
  { tags: ["bookings"] }
);

export const getBookingsByStatus = unstable_cache(
  async (status: string) => db.select().from(bookings).where(eq(bookings.status, status)).orderBy(desc(bookings.date)),
  ["bookings-by-status"],
  { tags: ["bookings"] }
);

export async function getAllUsers() {
  return db.select().from(users).orderBy(desc(users.createdAt));
}
