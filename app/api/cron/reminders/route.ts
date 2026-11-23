import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { bookings, classSessions } from "@/db/schema";
import { getClassSettings } from "@/lib/dal";
import { classAddress } from "@/lib/studio";
import { sendReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Tomorrow's date in Portland, "YYYY-MM-DD". */
function tomorrowInPortland(now = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date(now.getTime() + 24 * 60 * 60 * 1000));
}

/**
 * Daily cron (vercel.json): emails everyone with a paid booking for tomorrow — with the hall
 * address for THEIR class, read now, so an admin address change reaches people already booked.
 * Idempotent: each booking is claimed via reminder_sent_at before sending, so a re-run or a
 * stray request never sends twice.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorized = secret
    ? req.headers.get("authorization") === `Bearer ${secret}`
    : (req.headers.get("user-agent") ?? "").startsWith("vercel-cron/");
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = tomorrowInPortland();
  const rows = await db
    .select({ booking: bookings, session: classSessions })
    .from(bookings)
    .innerJoin(classSessions, eq(bookings.sessionId, classSessions.id))
    .where(and(
      eq(classSessions.date, date),
      eq(classSessions.cancelled, false),
      eq(bookings.status, "paid"),
      isNotNull(bookings.email),
      isNull(bookings.reminderSentAt),
    ));

  const settings = await getClassSettings();
  let sent = 0;
  for (const { booking, session } of rows) {
    const [claimed] = await db
      .update(bookings)
      .set({ reminderSentAt: new Date() })
      .where(and(eq(bookings.id, booking.id), isNull(bookings.reminderSentAt)))
      .returning();
    if (!claimed) continue;

    const ok = await sendReminderEmail({
      firstName: booking.firstName || booking.name.split(" ")[0],
      email: booking.email!,
      classType: session.classType,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      managementToken: booking.managementToken ?? "",
      address: classAddress(session.classType, settings),
    });
    if (ok) sent++;
    else await db.update(bookings).set({ reminderSentAt: null }).where(eq(bookings.id, booking.id));
  }

  return NextResponse.json({ date, candidates: rows.length, sent });
}
