import { Resend } from "resend";
import { STUDIO_ADDRESS_DISPLAY, STUDIO_DIRECTIONS_URL, buildGoogleCalendarUrl } from "@/lib/calendar";

const FROM = process.env.EMAIL_FROM || "bounce lab <booking@bounce-lab.com>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const CLASS_LABELS: Record<string, string> = { twerk: "Twerk", highheels: "High Heels" };

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

type BookingEmailData = {
  firstName: string;
  email: string;
  classType: string;
  date: string;
  startTime: string;
  endTime: string;
  amountCents: number;
  bookingId: number;
  managementToken: string;
};

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://bounce-lab.com";
}

/** Best-effort: never throws. A booking is confirmed by payment status, not by email delivery. */
export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  const resend = client();
  if (!resend) return;

  const classLabel = CLASS_LABELS[data.classType] ?? data.classType;
  const manageUrl = `${siteUrl()}/manage-booking/${data.managementToken}`;
  const calUrl = buildGoogleCalendarUrl({
    title: `${classLabel} @ bounce lab`,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    details: `Your ${classLabel} class at bounce lab. Manage your booking: ${manageUrl}`,
  });

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h2>Your class is booked!</h2>
      <p>Hi ${escapeHtml(data.firstName)}, you're all set for:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#666">Class</td><td style="padding:6px 0;font-weight:600">${classLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Date</td><td style="padding:6px 0;font-weight:600">${fmtDate(data.date)}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Time</td><td style="padding:6px 0;font-weight:600">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Location</td><td style="padding:6px 0;font-weight:600">${STUDIO_ADDRESS_DISPLAY}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Amount paid</td><td style="padding:6px 0;font-weight:600">$${(data.amountCents / 100).toFixed(2)}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Reference</td><td style="padding:6px 0;font-weight:600">#${data.bookingId}</td></tr>
      </table>
      <p><a href="${STUDIO_DIRECTIONS_URL}" style="color:#C9A96E">Get Directions</a> &nbsp;·&nbsp; <a href="${calUrl}" style="color:#C9A96E">Add to Google Calendar</a></p>
      <p><a href="${manageUrl}" style="color:#C9A96E">Manage your booking</a></p>
      <p style="color:#666;font-size:13px">Need to cancel or have a question? Reply to this email or contact us through the site.</p>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Your class is booked!",
    html,
  }).catch(() => {});
}

export async function sendAdminBookingNotificationEmail(data: {
  firstName: string;
  lastName: string;
  classType: string;
  date: string;
  startTime: string;
  amountCents: number;
}): Promise<void> {
  const resend = client();
  if (!resend || !ADMIN_EMAIL) return;

  const classLabel = CLASS_LABELS[data.classType] ?? data.classType;
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Booking — ${data.firstName} ${data.lastName} · ${classLabel}`,
    html: `<p><b>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</b> booked <b>${classLabel}</b> on ${fmtDate(data.date)} at ${fmtTime(data.startTime)} — $${(data.amountCents / 100).toFixed(2)} paid.</p>`,
  }).catch(() => {});
}

export async function sendReminderEmail(data: BookingEmailData): Promise<void> {
  const resend = client();
  if (!resend) return;

  const classLabel = CLASS_LABELS[data.classType] ?? data.classType;
  const manageUrl = `${siteUrl()}/manage-booking/${data.managementToken}`;

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Reminder: ${classLabel} tomorrow at ${fmtTime(data.startTime)}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
        <h2>See you tomorrow!</h2>
        <p>${classLabel} — ${fmtDate(data.date)} at ${fmtTime(data.startTime)}</p>
        <p>${STUDIO_ADDRESS_DISPLAY}</p>
        <p><a href="${STUDIO_DIRECTIONS_URL}" style="color:#C9A96E">Get Directions</a></p>
        <p><a href="${manageUrl}" style="color:#C9A96E">Manage your booking</a></p>
      </div>
    `,
  }).catch(() => {});
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
