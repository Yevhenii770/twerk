import { redirect } from "next/navigation";
import { getCurrentUser, getSchedule } from "@/lib/dal";
import { updateSchedule } from "@/app/actions/schedule";
import { CLASS_STATIC, CLASS_IDS, DAY_NAMES } from "@/lib/classes";
import Link from "next/link";
import type { ClassId } from "@/lib/classes";

export default async function SchedulePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const schedule = await getSchedule();
  const scheduleMap = Object.fromEntries(schedule.map(s => [s.classType, s]));

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ borderBottom: "2px solid #111", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 4 }}>bounce lab</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#fff" }}>Schedule</h1>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/admin" style={{ fontSize: 12, color: "#CCC", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>
            ← Bookings
          </Link>
          <Link href="/" style={{ fontSize: 12, color: "#fff", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>
            ← Site
          </Link>
        </div>
      </div>

      <div style={{ padding: "40px 32px", maxWidth: 760 }}>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 40, lineHeight: 1.6 }}>
          Edit the day and time for each class. Changes apply immediately across the whole site — booking form and schedule calendar.
        </p>

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
    <form
      action={updateSchedule}
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr 1fr 1fr auto",
        gap: 2,
        alignItems: "stretch",
        background: "var(--border, #DDD)",
      }}
    >
      <input type="hidden" name="classType" value={classType} />

      <div style={{ background: "#111", padding: "20px 24px", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>{label}</span>
      </div>

      <div style={{ background: "#fff", padding: "12px 16px" }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>
          Day
        </label>
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
        <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>
          Time
        </label>
        <input
          name="timeDisplay"
          defaultValue={currentTime}
          placeholder="e.g. 7:00–8:00 PM"
          style={{
            width: "100%", border: "none", borderBottom: "2px solid #111",
            fontFamily: "inherit", fontSize: 14, color: "#111",
            background: "transparent", outline: "none", padding: "4px 0",
          }}
        />
      </div>

      <div style={{ background: "#fff", padding: "12px 16px" }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>
          Duration
        </label>
        <input
          name="duration"
          defaultValue={currentDuration}
          placeholder="e.g. 60 min"
          style={{
            width: "100%", border: "none", borderBottom: "2px solid #111",
            fontFamily: "inherit", fontSize: 14, color: "#111",
            background: "transparent", outline: "none", padding: "4px 0",
          }}
        />
      </div>

      <div style={{ background: "#fff", padding: "12px 16px", display: "flex", alignItems: "flex-end" }}>
        <button
          type="submit"
          style={{
            background: "#111", color: "#fff", border: "none",
            padding: "10px 20px", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
          }}
        >
          Save
        </button>
      </div>
    </form>
  );
}
