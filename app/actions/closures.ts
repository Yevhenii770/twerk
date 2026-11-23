"use server";

import { db } from "@/db";
import { bookings, classSessions, closures } from "@/db/schema";
import { and, eq, gte, lte, inArray, ne } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { isClosed } from "@/lib/closures";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Not authorized");
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const CLASS_TYPES = ["twerk", "highheels"];

function sessionsInRange(start: string, end: string, classType: string | null) {
  const conds = [gte(classSessions.date, start), lte(classSessions.date, end)];
  if (classType) conds.push(eq(classSessions.classType, classType));
  return and(...conds);
}

export type AffectedBooking = { id: number; name: string; phone: string; email: string | null; classType: string; date: string };

/** People with a paid seat inside a closure — the admin must contact / refund them. */
async function paidBookingsIn(start: string, end: string, classType: string | null): Promise<AffectedBooking[]> {
  const sessions = await db.select({ id: classSessions.id }).from(classSessions).where(sessionsInRange(start, end, classType));
  if (sessions.length === 0) return [];
  return db
    .select({ id: bookings.id, name: bookings.name, phone: bookings.phone, email: bookings.email, classType: bookings.classType, date: bookings.date })
    .from(bookings)
    .where(and(inArray(bookings.sessionId, sessions.map(s => s.id)), eq(bookings.status, "paid")));
}

/** Close a date range (vacation / holiday) for one class or all classes. */
export async function addClosure(input: { startDate: string; endDate: string; classType: string | null; note?: string }) {
  await requireAdmin();
  const { startDate, endDate } = input;
  const classType = input.classType && CLASS_TYPES.includes(input.classType) ? input.classType : null;
  if (!ISO.test(startDate) || !ISO.test(endDate)) return { success: false as const, error: "Pick both dates" };
  if (endDate < startDate) return { success: false as const, error: "End date is before start date" };
  const note = input.note?.trim().slice(0, 80) || null;

  await db.insert(closures).values({ startDate, endDate, classType, note });
  await db
    .update(classSessions)
    .set({ cancelled: true, bookingOpen: false, updatedAt: new Date() })
    .where(sessionsInRange(startDate, endDate, classType));

  revalidateTag("closures");
  revalidateTag("class-sessions");
  return { success: true as const, affected: await paidBookingsIn(startDate, endDate, classType) };
}

/** Remove a closure and reopen its upcoming dates (unless another closure still covers them). */
export async function deleteClosure(id: number) {
  await requireAdmin();
  const [c] = await db.select().from(closures).where(eq(closures.id, id)).limit(1);
  if (!c) return { success: true as const };
  await db.delete(closures).where(eq(closures.id, id));

  const today = new Date().toISOString().split("T")[0];
  const others = await db.select().from(closures).where(ne(closures.id, id));
  const sessions = await db
    .select()
    .from(classSessions)
    .where(and(sessionsInRange(c.startDate < today ? today : c.startDate, c.endDate, c.classType), eq(classSessions.cancelled, true)));
  const reopen = sessions.filter(s => !isClosed(s.classType, s.date, others)).map(s => s.id);
  if (reopen.length) {
    await db.update(classSessions).set({ cancelled: false, bookingOpen: true, updatedAt: new Date() }).where(inArray(classSessions.id, reopen));
  }

  revalidateTag("closures");
  revalidateTag("class-sessions");
  return { success: true as const };
}

/** For the admin list: closures with the paid bookings still sitting inside each one. */
export async function getClosuresForAdmin() {
  await requireAdmin();
  const today = new Date().toISOString().split("T")[0];
  const list = await db.select().from(closures).where(gte(closures.endDate, today)).orderBy(closures.startDate);
  return Promise.all(list.map(async c => ({ ...c, affected: await paidBookingsIn(c.startDate, c.endDate, c.classType) })));
}
