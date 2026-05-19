"use server";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser, getSchedule } from "@/lib/dal";
import { revalidateTag } from "next/cache";

const PRICES: Record<string, Record<string, number>> = {
  twerk:      { dropin: 25, monthly: 80 },
  highheels:  { dropin: 30, monthly: 100 },
  stretching: { dropin: 20 },
};

const BookingSchema = z.object({
  name:        z.string().min(2, "Minimum 2 characters"),
  phone:       z.string().min(10, "Enter a valid phone number").regex(/^[\d\s\-\+\(\)]{10,}$/, "Enter a valid phone number"),
  email:       z.string().email().optional().or(z.literal("")),
  classType:   z.enum(["twerk", "highheels", "stretching"]),
  bookingType: z.enum(["dropin", "monthly"]).default("dropin"),
  date:        z.string().min(1, "Select a date"),
});

export async function createBooking(_: unknown, formData: FormData) {
  const raw = {
    name:        formData.get("name"),
    phone:       formData.get("phone"),
    email:       formData.get("email") || "",
    classType:   formData.get("classType"),
    bookingType: formData.get("bookingType") || "dropin",
    date:        formData.get("date"),
  };

  const parsed = BookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, phone, email, classType, bookingType, date } = parsed.data;

  const schedule = await getSchedule();
  const classSchedule = schedule.find(s => s.classType === classType);
  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  if (!classSchedule || dayOfWeek !== classSchedule.dayOfWeek) {
    return { success: false, errors: { date: ["Wrong day for this class"] } };
  }

  const price = PRICES[classType]?.[bookingType];
  if (price === undefined) {
    return { success: false, errors: { _: ["Invalid booking type for this class"] } };
  }

  const existing = await db.select({ id: bookings.id }).from(bookings)
    .where(and(
      eq(bookings.phone, phone),
      eq(bookings.classType, classType),
      eq(bookings.date, date),
    ))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, errors: { date: ["You already have a booking for this class on this date"] } };
  }

  try {
    await db.insert(bookings).values({
      name,
      phone,
      email: email || null,
      classType,
      bookingType,
      date,
      price,
      status: "pending",
    });

    revalidateTag("bookings");
    await sendTelegramNotification({ name, phone, email: email || null, classType, bookingType, date, price });
    return { success: true, data: { name, classType, date, price, bookingType } };
  } catch {
    return { success: false, errors: { _: ["Something went wrong, please try again"] } };
  }
}

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
  await db.delete(bookings).where(eq(bookings.id, id));
  revalidateTag("bookings");
  return { success: true };
}

const CLASS_LABELS: Record<string, string> = {
  twerk:     "Twerk",
  highheels: "High Heels",
  stretching: "Stretching",
};

async function sendTelegramNotification(data: {
  name: string;
  phone: string;
  email: string | null;
  classType: string;
  bookingType: string;
  date: string;
  price: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const dateFormatted = new Date(data.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const typeLabel = data.bookingType === "monthly" ? "Monthly pass · 4 classes" : "Drop-in";
  const classLabel = CLASS_LABELS[data.classType] ?? data.classType;

  const lines = [
    `🎉 <b>New Booking — ${classLabel}</b>`,
    `<blockquote>`,
    `👤  <b>Name</b>`,
    `     ${data.name}`,
    ``,
    `📱  <b>Phone</b>`,
    `     ${data.phone}`,
    data.email ? `\n📧  <b>Email</b>\n     ${data.email}` : null,
    ``,
    `💃  <b>Class</b>`,
    `     ${classLabel}`,
    ``,
    `🗓  <b>Date</b>`,
    `     ${dateFormatted}`,
    ``,
    `🎟  <b>Type</b>`,
    `     ${typeLabel}`,
    ``,
    `💵  <b>Price</b>`,
    `     $${data.price}`,
    `</blockquote>`,
  ].filter((l) => l !== null).join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "HTML" }),
  }).catch(() => {});
}
