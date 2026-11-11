import { redirect } from "next/navigation";
import { getCurrentUser, getSchedule } from "@/lib/dal";
import { updateSchedule } from "@/app/actions/schedule";
import { CLASS_STATIC, CLASS_IDS, DAY_NAMES } from "@/lib/classes";
import Link from "next/link";
import type { ClassId } from "@/lib/classes";
import { getOffScheduleSessions, isoDayOfWeek } from "@/lib/sessions";

type SearchParams = Promise<{ saved?: string; cancelled?: string; closed?: string; error?: string }>;

export default async function SchedulePage({ searchParams }: { searchParams: SearchParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const [schedule, offSchedule, params] = await Promise.all([getSchedule(), getOffScheduleSessions(), searchParams]);
  const needsAttention = offSchedule.filter(s => s.booked > 0);
  const savedLabel = params.saved && params.saved in CLASS_STATIC ? CLASS_STATIC[params.saved as ClassId].label : null;
  const scheduleMap = Object.fromEntries(schedule.map(s => [s.classType, s]));

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "inherit" }}>

      {/* Mobile header */}
      <div className="md:hidden" style={{ background: "#111", padding: "16px", marginBottom: 0, borderBottom: "2px solid #111" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 2 }}>bounce lab</p>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#fff" }}>Schedule</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin" style={{ fontSize: 11, color: "#CCC", textDecoration: "none", border: "1px solid #555", padding: "7px 12px" }}>
              ← Back
            </Link>
            <Link href="/" style={{ fontSize: 11, color: "#fff", textDecoration: "none", border: "1px solid #555", padding: "7px 12px" }}>
              Site
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex" style={{ borderBottom: "2px solid #111", padding: "20px 32px", alignItems: "center", justifyContent: "space-between", background: "#111" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 4 }}>bounce lab</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#fff" }}>Schedule</h1>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/admin" style={{ fontSize: 12, color: "#CCC", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>← Bookings</Link>
          <Link href="/" style={{ fontSize: 12, color: "#fff", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>← Site</Link>
        </div>
      </div>

      <div className="p-4 md:p-8" style={{ maxWidth: 760 }}>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 28, lineHeight: 1.6 }}>
          Edit the day and time for each class. Saving updates the schedule everywhere on the site
          (home page, class pages, footer, FAQ, Google data) and the booking page: dates for the new
          day/time are created for the next 8 weeks, and empty dates at the old day/time are removed.
          Time format: <b>7:00–8:00 PM</b> or <b>11:00 AM–12:20 PM</b>.
          To adjust the capacity or open/closed state of one specific date,
          use the roster on the <Link href="/admin" style={{ color: "#C9A96E" }}>main admin page</Link>.
        </p>

        {savedLabel && (
          <div style={{ background: "#EAF6EC", border: "1px solid #9BC8A3", padding: "14px 18px", marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
            ✓ {savedLabel} schedule saved and updated across the site and booking page.
            {Number(params.cancelled) > 0 && <> Removed {params.cancelled} empty date(s) at the old time.</>}
            {Number(params.closed) > 0 && <> {params.closed} date(s) at the old time already had students — see below.</>}
          </div>
        )}
        {params.error === "time" && (
          <div style={{ background: "#FDECEC", border: "1px solid #E3A1A1", padding: "14px 18px", marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
            Not saved: the time must look like <b>7:00–8:00 PM</b> or <b>11:00 AM–12:20 PM</b>.
          </div>
        )}
        {params.error === "invalid" && (
          <div style={{ background: "#FDECEC", border: "1px solid #E3A1A1", padding: "14px 18px", marginBottom: 20, fontSize: 13 }}>
            Not saved: please fill in day, time and duration.
          </div>
        )}

        {needsAttention.length > 0 && (
          <div style={{ border: "2px solid #C9A96E", background: "#FFF8EC", padding: "16px 18px", marginBottom: 28, fontSize: 13, lineHeight: 1.6 }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>⚠ Students booked at an old time</p>
            <p style={{ color: "#555", marginBottom: 10 }}>
              These dates are no longer on the schedule and are closed to new bookings, but students
              already paid for them. Contact them to move or refund, then cancel the date on the{" "}
              <Link href="/admin" style={{ color: "#C9A96E" }}>main admin page</Link>.
            </p>
            {needsAttention.map(s => (
              <div key={s.id} style={{ padding: "6px 0", borderTop: "1px solid #EEDDBB" }}>
                {CLASS_STATIC[s.classType as ClassId]?.label ?? s.classType} — {DAY_NAMES[isoDayOfWeek(s.date)]}, {s.date}, {s.startTime} · <b>{s.booked} booked</b>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CLASS_IDS.map(id => {
            const cls = CLASS_STATIC[id as ClassId];
            const sched = scheduleMap[id];
            return (
              <ScheduleRow
                key={id}
                classType={id}
                label={cls.label}
                currentDay={sched?.dayOfWeek ?? 0}
                currentTime={sched?.timeDisplay ?? ""}
                currentDuration={sched?.duration ?? ""}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScheduleRow({
  classType,
  label,
  currentDay,
  currentTime,
  currentDuration,
}: {
  classType: string;
  label: string;
  currentDay: number;
  currentTime: string;
  currentDuration: string;
}) {
  return (
    <form action={updateSchedule} style={{ background: "#DDD", gap: 1, display: "flex", flexDirection: "column" }}>
      <input type="hidden" name="classType" value={classType} />

      {/* Class label */}
      <div style={{ background: "#111", padding: "14px 20px" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>{label}</span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 1, background: "#DDD" }}>
        <div style={{ background: "#fff", padding: "12px 16px" }}>
          <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>Day</label>
          <select
            name="dayOfWeek"
            defaultValue={currentDay}
            style={{
              width: "100%", border: "none", borderBottom: "2px solid #111",
              fontFamily: "inherit", fontSize: 14, color: "#111",
              background: "transparent", outline: "none", padding: "4px 0", cursor: "pointer",
            }}
          >
            {DAY_NAMES.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
        </div>

        <div style={{ background: "#fff", padding: "12px 16px" }}>
          <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>Time</label>
          <input
            name="timeDisplay"
            defaultValue={currentTime}
            placeholder="e.g. 7:00–8:00 PM"
            style={{
              width: "100%", border: "none", borderBottom: "2px solid #111",
              fontFamily: "inherit", fontSize: 14, color: "#111",
              background: "transparent", outline: "none", padding: "4px 0",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ background: "#fff", padding: "12px 16px" }}>
          <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>Duration</label>
          <input
            name="duration"
            defaultValue={currentDuration}
            placeholder="e.g. 60 min"
            style={{
              width: "100%", border: "none", borderBottom: "2px solid #111",
              fontFamily: "inherit", fontSize: 14, color: "#111",
              background: "transparent", outline: "none", padding: "4px 0",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Save button */}
      <div style={{ background: "#fff", padding: "12px 16px" }}>
        <button
          type="submit"
          style={{
            background: "#111", color: "#fff", border: "none",
            padding: "12px 24px", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "inherit", width: "100%",
          }}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
