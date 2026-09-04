"use server";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/dal";
import { revalidateTag } from "next/cache";
import { releaseSeat } from "@/lib/reserve";

// Manages legacy (pre-Square) bookings created via the old phone-confirm flow — rows where
// sessionId is null. New payment-gated bookings are managed via app/actions/adminBooking.ts.

export async function updateBookingStatus(id: number, status: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { success: false };
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  revalidateTag("bookings");
  return { success: true };
}

export async function deleteBooking(id: number) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { success: false };

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  await db.delete(bookings).where(eq(bookings.id, id));
  if (booking?.sessionId && (booking.status === "paid")) {
    await releaseSeat(booking.sessionId);
  }

  revalidateTag("bookings");
  revalidateTag("class-sessions");
  return { success: true };
}
