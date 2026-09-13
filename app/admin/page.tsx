import { getAdminSessionRoster, getLegacyBookings, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/booking";
import DeleteConfirmBtn from "@/components/DeleteConfirmBtn";
import SessionCard from "@/components/admin/SessionCard";
import Link from "next/link";

const CLASS_LABELS: Record<string, string> = {
  twerk: "Twerk",
  highheels: "High Heels",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FFF3CD", color: "#7A4F00" },
  confirmed: { bg: "#CCE5FF", color: "#003D80" },
  paid:      { bg: "#D4EDDA", color: "#155724" },
  cancelled: { bg: "#E2E2E2", color: "#444" },
};

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const [roster, legacyBookings] = await Promise.all([getAdminSessionRoster(), getLegacyBookings()]);

  const totalUpcomingPaid = roster.reduce((sum, r) => sum + r.attendees.filter(a => a.status === "paid").length, 0);
  const totalUpcomingSpots = roster.reduce((sum, r) => sum + r.session.capacity, 0);
  const legacyPending = legacyBookings.filter(b => b.status === "pending").length;

  return (
    <div className="light-page" style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "inherit" }}>

      {/* Mobile header */}
      <div className="md:hidden" style={{ background: "#111", padding: "16px", marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 2 }}>bounce lab</p>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#fff" }}>Admin Panel</h1>
          </div>
          <Link href="/" style={{ fontSize: 12, color: "#fff", textDecoration: "none", border: "1px solid #555", padding: "7px 12px" }}>
            ← Site
          </Link>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/admin/schedule" style={{ fontSize: 11, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "7px 14px", flex: 1, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
            Schedule
          </Link>
          <Link href="/admin/classes" style={{ fontSize: 11, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "7px 14px", flex: 1, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
            Photos
          </Link>
          <Link href="/admin/messages" style={{ fontSize: 11, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "7px 14px", flex: 1, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
            Messages
          </Link>
          <Link href="/admin/password" style={{ fontSize: 11, color: "#CCC", textDecoration: "none", border: "1px solid #555", padding: "7px 14px", flex: 1, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
            Password
          </Link>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex" style={{ borderBottom: "2px solid #111", padding: "20px 32px", alignItems: "center", justifyContent: "space-between", background: "#111" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 4 }}>bounce lab</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#fff" }}>Admin Panel</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 13, color: "#CCC" }}>{currentUser.email}</span>
          <Link href="/admin/schedule" style={{ fontSize: 12, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "6px 14px" }}>Edit Schedule</Link>
          <Link href="/admin/classes" style={{ fontSize: 12, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "6px 14px" }}>Class Photos</Link>
          <Link href="/admin/messages" style={{ fontSize: 12, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "6px 14px" }}>Messages</Link>
          <Link href="/admin/export" style={{ fontSize: 12, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "6px 14px" }}>Export CSV</Link>
          <Link href="/admin/password" style={{ fontSize: 12, color: "#CCC", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>Change Password</Link>
          <Link href="/" style={{ fontSize: 12, color: "#fff", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>← Site</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 1, background: "#DDD", borderBottom: "2px solid #111" }}>
        {[
          { label: "Upcoming Sessions", value: roster.length,        bg: "#111",    text: "#fff" },
          { label: "Booked Seats",      value: totalUpcomingPaid,    bg: "#D4EDDA", text: "#155724" },
          { label: "Total Capacity",    value: totalUpcomingSpots,   bg: "#CCE5FF", text: "#003D80" },
          { label: "Legacy Pending",    value: legacyPending,        bg: "#FFF3CD", text: "#7A4F00" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px 20px", background: s.bg }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: s.text, marginBottom: 6, opacity: 0.7 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.text, margin: 0, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-4 md:p-8">
        <h2 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          Upcoming Schedule &amp; Roster
        </h2>
        {roster.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>No upcoming sessions. Visit the booking page once to auto-generate them, or check Edit Schedule.</p>
        ) : (
          <div style={{ marginBottom: 40 }}>
            {roster.map(r => <SessionCard key={r.session.id} session={r.session} attendees={r.attendees} />)}
          </div>
        )}

        <LegacySection bookings={legacyBookings} />
      </div>
    </div>
  );
}

function LegacySection({ bookings }: { bookings: Awaited<ReturnType<typeof getLegacyBookings>> }) {
  if (bookings.length === 0) return null;

  return (
    <details style={{ marginTop: 24 }}>
      <summary style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginBottom: 16 }}>
        Legacy Bookings (pre-Square, {bookings.length})
      </summary>
      <p style={{ fontSize: 12, color: "#888", margin: "8px 0 16px" }}>
        Bookings made before online payment was added. Status here was set manually by phone — not payment-verified.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #111", background: "#F5F5F5" }}>
              {["Date", "Class", "Name", "Phone", "Type", "Price", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #DDD", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>{CLASS_LABELS[b.classType] || b.classType}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>{b.name}</td>
                <td style={{ padding: "10px 12px", color: "#333" }}>{b.phone}</td>
                <td style={{ padding: "10px 12px", color: "#333" }}>{b.bookingType === "monthly" ? "Monthly" : "Drop-in"}</td>
                <td style={{ padding: "10px 12px", fontWeight: 800 }}>${b.price}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", background: STATUS_STYLE[b.status]?.bg || "#EEE", color: STATUS_STYLE[b.status]?.color || "#333" }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {b.status === "pending" && <StatusButton id={b.id} status="confirmed" label="✓ Confirm" bg="#1565C0" />}
                    {b.status === "confirmed" && <StatusButton id={b.id} status="paid" label="✓ Paid" bg="#2E7D32" />}
                    {b.status !== "cancelled" && <StatusButton id={b.id} status="cancelled" label="✕ Cancel" bg="#555" />}
                    <DeleteConfirmBtn id={b.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function StatusButton({ id, status, label, bg }: {
  id: number; status: string; label: string; bg: string
}) {
  return (
    <form action={async () => { "use server"; await updateBookingStatus(id, status); }}>
      <button
        type="submit"
        style={{
          background: bg, color: "#fff", border: "none",
          padding: "6px 12px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.05em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {label}
      </button>
    </form>
  );
}
