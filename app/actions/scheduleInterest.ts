"use server";

import { db } from "@/db";
import { classScheduleInterest } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";

const ScheduleInterestSchema = z.object({
  name:      z.string().trim().max(80).optional().or(z.literal("")),
  email:     z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
  phone:     z.string().trim().min(7, "Enter a valid phone number").max(30).optional().or(z.literal("")),
  classType: z.enum(["twerk", "highheels", "stretching"]),
}).refine(d => Boolean(d.email) || Boolean(d.phone), {
  message: "Enter an email or phone number",
  path: ["email"],
});

const CLASS_LABELS: Record<string, string> = {
  twerk: "Twerk",
  highheels: "High Heels",
  stretching: "Stretching",
};

export async function submitScheduleInterest(_: unknown, formData: FormData) {
  // Honeypot: real visitors never fill this hidden field.
  if (formData.get("website")) {
    return { success: true };
  }

  const raw = {
    name:      formData.get("name") || "",
    email:     formData.get("email") || "",
    phone:     formData.get("phone") || "",
    classType: formData.get("classType"),
  };

  const parsed = ScheduleInterestSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, classType } = parsed.data;

  try {
    const dupeConditions = [];
    if (email) dupeConditions.push(eq(classScheduleInterest.email, email));
    if (phone) dupeConditions.push(eq(classScheduleInterest.phone, phone));

    const existing = await db.select({ id: classScheduleInterest.id }).from(classScheduleInterest)
      .where(and(eq(classScheduleInterest.classType, classType), or(...dupeConditions)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(classScheduleInterest).values({
        classType,
        name: name || null,
        email: email || null,
        phone: phone || null,
      });

      await sendTelegramNotification({ name, email, phone, classType });
    }

    return { success: true };
  } catch {
    return { success: false, errors: { _: ["Something went wrong, please try again"] } };
  }
}

async function sendTelegramNotification(data: { name?: string; email?: string; phone?: string; classType: string }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const classLabel = CLASS_LABELS[data.classType] ?? data.classType;

  const lines = [
    `🔔 <b>New Times Interest — ${classLabel}</b>`,
    `<blockquote>`,
    data.name ? `👤  <b>Name</b>\n     ${data.name}\n` : null,
    data.email ? `✉️  <b>Email</b>\n     ${data.email}\n` : null,
    data.phone ? `📱  <b>Phone</b>\n     ${data.phone}\n` : null,
    `💃  <b>Class</b>`,
    `     ${classLabel}`,
    `</blockquote>`,
  ].filter((l) => l !== null).join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "HTML" }),
  }).catch(() => {});
}
