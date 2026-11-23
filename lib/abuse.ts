import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { and, eq, gte, inArray, or, sql, type SQL } from "drizzle-orm";
import { sendAdminAlertEmail } from "@/lib/email";
import { alertAdminError } from "@/lib/alerts";

/**
 * Anti-abuse limits for checkout and self-service refunds (owner-approved 2026-11-22).
 * Everything is counted from the database, so limits hold across every serverless instance
 * (an in-memory limiter would reset per instance). Tuned so a real student never hits them:
 * a normal person pays once a week and cancels once or twice a month.
 */
export const LIMITS = {
  declinesPerHour: 3,        // per email / phone / device IP → pause payments 1h + alert
  declinesPerHourNoCaptcha: 2, // stricter when the bot check didn't pass (e.g. blocked by an ad blocker)
  paymentsPerHour: 3,        // successful payments per email / phone
  seatsPerSession: 2,        // "me + a friend", not the whole class
  siteDeclinesPerHour: 5,    // whole site → looks like card testing → alert
  autoRefundsPer30Days: 2,   // per email / phone / card; beyond → admin reviews the refund
} as const;

const HOUR = 60 * 60 * 1000;

export function normEmail(e: string) { return e.trim().toLowerCase(); }
export function normPhone(p: string) { return p.replace(/\D/g, "").slice(-10); }

type Who = { email: string; phone: string; ip: string };

function identity(w: Who, withIp: boolean): SQL {
  const conds: SQL[] = [eq(payments.buyerEmail, normEmail(w.email)), eq(payments.buyerPhone, normPhone(w.phone))];
  if (withIp && w.ip && w.ip !== "unknown") conds.push(eq(payments.clientIp, w.ip));
  return or(...conds)!;
}

async function countPayments(w: Who, status: string, withIp: boolean): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(payments)
    .where(and(identity(w, withIp), eq(payments.status, status), gte(payments.createdAt, new Date(Date.now() - HOUR))));
  return row?.n ?? 0;
}

/** Runs before any charge. Returns a customer-facing reason when the attempt must not proceed. */
export async function checkoutBlockReason(w: Who & { sessionIds: number[]; humanVerified: boolean }): Promise<string | null> {
  const declines = await countPayments(w, "failed", true);
  const declineLimit = w.humanVerified ? LIMITS.declinesPerHour : LIMITS.declinesPerHourNoCaptcha;
  if (declines >= declineLimit) {
    return "For your security, payments are paused for about an hour after several declined cards. Please try again later or contact us — we're happy to help you book.";
  }

  const paid = await countPayments(w, "completed", false);
  if (paid >= LIMITS.paymentsPerHour) {
    return "You've made several bookings in the last hour. Please contact us if you'd like to book more spots.";
  }

  if (w.sessionIds.length) {
    const rows = await db
      .select({ sessionId: bookings.sessionId, n: sql<number>`count(*)::int` })
      .from(bookings)
      .where(and(
        inArray(bookings.sessionId, w.sessionIds),
        eq(bookings.status, "paid"),
        sql`lower(${bookings.email}) = ${normEmail(w.email)}`,
      ))
      .groupBy(bookings.sessionId);
    if (rows.some(r => r.n >= LIMITS.seatsPerSession)) {
      return `You already have ${LIMITS.seatsPerSession} spots in this class. Please contact us if you need more.`;
    }
  }
  return null;
}

/** After a declined card: alert once when a person or the whole site crosses the threshold. */
export async function afterDecline(w: Who) {
  try {
    const mine = await countPayments(w, "failed", true);
    if (mine === LIMITS.declinesPerHour) {
      await notify(
        `${mine} declined cards in an hour`,
        `Payments from ${normEmail(w.email)} / ${normPhone(w.phone)} (IP ${w.ip}) were paused for an hour after ${mine} declined cards. Usually a real customer with card trouble — if they contact you, help them book. If it repeats, it may be someone testing stolen cards.`,
      );
    }
    const [site] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(payments)
      .where(and(eq(payments.status, "failed"), gte(payments.createdAt, new Date(Date.now() - HOUR))));
    if ((site?.n ?? 0) === LIMITS.siteDeclinesPerHour) {
      await notify(
        "Possible card testing on bounce-lab.com",
        `${site.n} declined payments across the site in the last hour. This can mean someone is testing stolen cards, which Square treats seriously. Check Square → Transactions; tell Claude if it continues.`,
      );
    }
  } catch (e) {
    await alertAdminError("afterDecline", e);
  }
}

/** How many self-service refunds this person (email, phone or card) got in the last 30 days. */
export async function recentAutoRefunds(p: { email: string | null; phone: string | null; cardFingerprint: string | null }): Promise<number> {
  const conds: SQL[] = [];
  if (p.email) conds.push(eq(payments.buyerEmail, normEmail(p.email)));
  if (p.phone) conds.push(eq(payments.buyerPhone, normPhone(p.phone)));
  if (p.cardFingerprint) conds.push(eq(payments.cardFingerprint, p.cardFingerprint));
  if (!conds.length) return 0;
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(payments)
    .where(and(or(...conds), eq(payments.status, "refunded"), gte(payments.updatedAt, new Date(Date.now() - 30 * 24 * HOUR))));
  return row?.n ?? 0;
}

export async function notify(subject: string, body: string) {
  await Promise.all([
    sendAdminAlertEmail(subject, body),
    alertAdminError(subject, body),
  ]);
}
