"use server";

import { db } from "@/db";
import { getSession } from "./auth";
import { eq, desc, gte, isNull, isNotNull, and } from "drizzle-orm";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { bookings, users, schedules, classSettings, classSessions, contactMessages } from "@/db/schema";
import { DEFAULT_SCHEDULES } from "./classes";

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

export const getSchedule = unstable_cache(
  async () => {
    const rows = await db.select().from(schedules);
    if (rows.length > 0) return rows;
    await db.insert(schedules).values(DEFAULT_SCHEDULES);
    return DEFAULT_SCHEDULES.map(r => ({ ...r, updatedAt: new Date() }));
  },
  ["schedule"],
  { tags: ["schedule"] }
);

export const getLegacyBookings = unstable_cache(
  async () => db.select().from(bookings).where(isNull(bookings.sessionId)).orderBy(desc(bookings.date)),
  ["legacy-bookings"],
  { tags: ["bookings"] }
);

export const getAdminSessionRoster = unstable_cache(
  async () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const cutoff = today.toISOString().split("T")[0];

    const [sessions, sessionBookings] = await Promise.all([
      db.select().from(classSessions).where(gte(classSessions.date, cutoff)).orderBy(classSessions.date, classSessions.startTime),
      db.select().from(bookings).where(and(isNotNull(bookings.sessionId), gte(bookings.date, cutoff))),
    ]);

    return sessions.map(session => ({
      session,
      attendees: sessionBookings.filter(b => b.sessionId === session.id),
    }));
  },
  ["admin-session-roster"],
  { tags: ["class-sessions", "bookings"], revalidate: 30 }
);

export const getContactMessages = unstable_cache(
  async () => db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)),
  ["contact-messages"],
  { tags: ["contact-messages"] }
);

export const getClassSettings = unstable_cache(
  async () => {
    const rows = await db.select().from(classSettings);
    return Object.fromEntries(rows.map(r => [r.classType, {
      photoPosition: r.photoPosition,
      photoUrl:      r.photoUrl ?? null,
      desc:          r.desc ?? null,
      modalTexts:    r.modalTexts ? (JSON.parse(r.modalTexts) as string[]) : null,
    }])) as Record<string, { photoPosition: string; photoUrl: string | null; desc: string | null; modalTexts: string[] | null }>;
  },
  ["class-settings"],
  { tags: ["class-settings"] }
);
