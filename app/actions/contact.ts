"use server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { z } from "zod";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { revalidateTag } from "next/cache";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  inquiryType: z.enum(["question", "problem", "other"]).optional(),
  message: z.string().trim().min(5, "Please add a short message").max(2000),
});

export async function submitContactMessage(_: unknown, formData: FormData) {
  // Honeypot — real visitors never fill this hidden field.
  if (formData.get("website")) return { success: true };

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return { success: false, errors: { _: ["Too many messages sent. Please try again later."] } };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    inquiryType: formData.get("inquiryType") || undefined,
    message: formData.get("message"),
  };

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, inquiryType, message } = parsed.data;

  try {
    await db.insert(contactMessages).values({
      name, email, phone: phone || null, inquiryType: inquiryType || null, message,
    });
    revalidateTag("contact-messages");

    await sendTelegramNotification({ name, email, phone, inquiryType, message });
    return { success: true };
  } catch {
    return { success: false, errors: { _: ["Something went wrong, please try again"] } };
  }
}

async function sendTelegramNotification(data: { name: string; email: string; phone?: string; inquiryType?: string; message: string }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    `✉️ <b>New Contact Message</b>`,
    `<blockquote>`,
    `👤  <b>Name</b>\n     ${data.name}`,
    ``,
    `📧  <b>Email</b>\n     ${data.email}`,
    data.phone ? `\n📱  <b>Phone</b>\n     ${data.phone}` : ``,
    data.inquiryType ? `\n🏷  <b>Type</b>\n     ${data.inquiryType}` : ``,
    `\n💬  <b>Message</b>\n     ${data.message}`,
    `</blockquote>`,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "HTML" }),
  }).catch(() => {});
}
