import { db } from "@/db";
import { bookings, classSessions } from "@/db/schema";
import { and, eq, gte, inArray, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { getClassSettings } from "@/lib/dal";
import { classAddress } from "@/lib/studio";
import { getNextBookable } from "@/lib/nextSessions";
import { studioTodayIso } from "@/lib/studioTime";
import { buildFollowup } from "@/lib/followupCopy";
import { sendFollowupEmail } from "@/lib/email";
import type { ClassId } from "@/lib/classes";

/** Look back this many days, so a missed cron run still catches people (copy says "on Thursday"). */
const LOOKBACK_DAYS = 3;

function daysBefore(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export type FollowupResult = { email: string; action: "sent" | "would_send" | "skipped"; reason?: string; subject?: string; html?: string };

/**
 * "Thanks for your first class" email, run from the daily cron (~9 AM Portland).
 * Goes to every NEW student once in their life: their first paid class ended in the last few days,
 * they have no earlier class with us, and they've never had this email. Next class day/time/price/
 * address are read from the live schedule at send time, so a schedule change is reflected
 * automatically. Skipped (and marked done) for people who already booked again or bought a pass.
 */
export async function runFirstClassFollowups(opts: { dryRun?: boolean } = {}): Promise<FollowupResult[]> {
  const today = studioTodayIso();
  const rows = await db
    .select({ booking: bookings, session: classSessions })
    .from(bookings)
    .innerJoin(classSessions, eq(bookings.sessionId, classSessions.id))
    .where(and(
      gte(classSessions.date, daysBefore(today, LOOKBACK_DAYS)),
      lt(classSessions.date, today),
      eq(classSessions.cancelled, false),
      eq(bookings.status, "paid"),
      isNotNull(bookings.email),
      isNull(bookings.followupSentAt),
      // admin marked "no-show" → they didn't actually come
      or(isNull(bookings.attended), eq(bookings.attended, true)),
    ));
  if (!rows.length) return [];

  // One email per person, about their earliest class in the window.
  const byEmail = new Map<string, (typeof rows)[number]>();
  for (const r of rows.sort((a, b) => a.session.date.localeCompare(b.session.date))) {
    const key = r.booking.email!.trim().toLowerCase();
    if (!byEmail.has(key)) byEmail.set(key, r);
  }

  const emails = [...byEmail.keys()];
  const history = await db
    .select({ email: sql<string>`lower(${bookings.email})`, date: bookings.date, status: bookings.status, followupSentAt: bookings.followupSentAt })
    .from(bookings)
    .where(inArray(sql`lower(${bookings.email})`, emails));

  const [next, settings] = await Promise.all([getNextBookable(), getClassSettings()]);
  const out: FollowupResult[] = [];

  for (const [email, { booking, session }] of byEmail) {
    const mine = history.filter(h => h.email === email);
    let reason: string | null = null;
    if (mine.some(h => h.followupSentAt)) reason = "already got this email";
    // legacy "pending" rows are old pre-payment bookings of real students → not new
    else if (mine.some(h => (h.status === "paid" || h.status === "pending") && h.date < session.date)) reason = "not their first class";
    else if (booking.bookingType === "monthly") reason = "bought a Monthly Pass";
    else if (mine.some(h => h.status === "paid" && h.date >= today)) reason = "already booked again";

    const markDone = async () => {
      // mark every row of this person in the window, so they're never picked again
      const ids = rows.filter(r => r.booking.email!.trim().toLowerCase() === email).map(r => r.booking.id);
      const claimed = await db.update(bookings).set({ followupSentAt: new Date() })
        .where(and(inArray(bookings.id, ids), isNull(bookings.followupSentAt))).returning();
      return claimed.length > 0;
    };

    if (reason) {
      if (!opts.dryRun) await markDone();
      out.push({ email, action: "skipped", reason });
      continue;
    }

    const n = next[session.classType as ClassId];
    // No open class to offer (vacation / sold out): don't send yet, try again tomorrow.
    if (!n) { out.push({ email, action: "skipped", reason: "no open class yet, will retry" }); continue; }
    const { subject, html } = buildFollowup({
      firstName: booking.firstName || booking.name.split(" ")[0],
      classType: session.classType,
      attended: { date: session.date, startTime: session.startTime },
      next: { id: n.id, date: n.date, startTime: n.startTime, endTime: n.endTime, price: n.price },
      address: classAddress(session.classType, settings),
      today,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://bounce-lab.com",
    });

    if (opts.dryRun) { out.push({ email, action: "would_send", subject, html }); continue; }
    if (!(await markDone())) continue; // another run got it
    const ok = await sendFollowupEmail(booking.email!, subject, html);
    if (!ok) {
      const ids = rows.filter(r => r.booking.email!.trim().toLowerCase() === email).map(r => r.booking.id);
      await db.update(bookings).set({ followupSentAt: null }).where(inArray(bookings.id, ids));
    }
    out.push({ email, action: ok ? "sent" : "skipped", reason: ok ? undefined : "send failed, will retry tomorrow", subject });
  }
  return out;
}
