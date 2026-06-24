import { getAllBookings, getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/booking";
import DeleteConfirmBtn from "@/components/DeleteConfirmBtn";
import Link from "next/link";

const CLASS_LABELS: Record<string, string> = {
  twerk: "Twerk",
  highheels: "High Heels",
  stretching: "Stretching",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FFF3CD", color: "#7A4F00" },
  confirmed: { bg: "#CCE5FF", color: "#003D80" },
  paid:      { bg: "#D4EDDA", color: "#155724" },
  cancelled: { bg: "#E2E2E2", color: "#444" },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const { status: filterStatus } = await searchParams;
  const allBookings = await getAllBookings();

  const filtered = filterStatus && filterStatus !== "all"
    ? allBookings.filter(b => b.status === filterStatus)
    : allBookings;

  const counts = {
    all:       allBookings.length,
    pending:   allBookings.filter(b => b.status === "pending").length,
    confirmed: allBookings.filter(b => b.status === "confirmed").length,
    paid:      allBookings.filter(b => b.status === "paid").length,
    cancelled: allBookings.filter(b => b.status === "cancelled").length,
  };

  const tabs = [
    { key: "all",       label: "All",       count: counts.all },
    { key: "pending",   label: "Pending",   count: counts.pending },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "paid",      label: "Paid",      count: counts.paid },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  const active = filterStatus || "all";

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
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/schedule" style={{ fontSize: 11, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "7px 14px", flex: 1, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
            Schedule
          </Link>
          <Link href="/admin/classes" style={{ fontSize: 11, color: "#C9A96E", textDecoration: "none", border: "1px solid #C9A96E", padding: "7px 14px", flex: 1, textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
            Photos
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
          <Link href="/admin/password" style={{ fontSize: 12, color: "#CCC", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>Change Password</Link>
          <Link href="/" style={{ fontSize: 12, color: "#fff", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>← Site</Link>
        </div>
      </div>

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 1, background: "#DDD", borderBottom: "2px solid #111" }}>
        {[
          { label: "Total",     value: counts.all,       bg: "#111",    text: "#fff" },
          { label: "Pending",   value: counts.pending,   bg: "#FFF3CD", text: "#7A4F00" },
          { label: "Confirmed", value: counts.confirmed, bg: "#CCE5FF", text: "#003D80" },
          { label: "Paid",      value: counts.paid,      bg: "#D4EDDA", text: "#155724" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px 20px", background: s.bg }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: s.text, marginBottom: 6, opacity: 0.7 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.text, margin: 0, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #111", background: "#F5F5F5", overflowX: "auto" }}>
        {tabs.map(t => (
          <Link
            key={t.key}
            href={`/admin?status=${t.key}`}
            style={{
              padding: "12px 16px",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRight: "1px solid #DDD",
              borderBottom: active === t.key ? "3px solid #111" : "3px solid transparent",
              color: active === t.key ? "#111" : "#666",
              fontWeight: active === t.key ? 700 : 400,
              background: active === t.key ? "#fff" : "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {t.label} <span style={{ color: "#999", marginLeft: 4 }}>{t.count}</span>
          </Link>
        ))}
      </div>

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <div style={{ padding: "48px 20px", color: "#666", fontSize: 14 }}>No bookings yet.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #111", background: "#F5F5F5" }}>
                  {["Date", "Class", "Name", "Phone", "Instagram", "Type", "Price", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", fontWeight: 800 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #DDD", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "14px 16px", color: "#111", whiteSpace: "nowrap", fontWeight: 500 }}>
                      {new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ color: "#111", fontWeight: 700 }}>{CLASS_LABELS[b.classType] || b.classType}</span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#111", fontWeight: 700 }}>{b.name}</td>
                    <td style={{ padding: "14px 16px", color: "#333" }}>{b.phone}</td>
                    <td style={{ padding: "14px 16px", color: b.instagram ? "#333" : "#AAA" }}>{b.instagram ?? "—"}</td>
                    <td style={{ padding: "14px 16px", color: "#333" }}>{b.bookingType === "monthly" ? "Monthly" : "Drop-in"}</td>
                    <td style={{ padding: "14px 16px", color: "#111", fontWeight: 800, fontSize: 16 }}>${b.price}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "4px 10px", background: STATUS_STYLE[b.status]?.bg || "#EEE",
                        color: STATUS_STYLE[b.status]?.color || "#333", borderRadius: 2, border: "1px solid rgba(0,0,0,0.15)",
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
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

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {filtered.map(b => (
              <div key={b.id} style={{ border: "1px solid #E0E0E0", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 14px", borderBottom: "1px solid #F0F0F0" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>{b.name}</p>
                    <p style={{ fontSize: 12, color: "#666", margin: "3px 0 0" }}>
                      {new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}{CLASS_LABELS[b.classType] || b.classType}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "4px 8px", background: STATUS_STYLE[b.status]?.bg || "#EEE",
                    color: STATUS_STYLE[b.status]?.color || "#333", border: "1px solid rgba(0,0,0,0.1)",
                    whiteSpace: "nowrap", marginLeft: 8,
                  }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ padding: "10px 14px", display: "flex", gap: 12, fontSize: 12, color: "#555", flexWrap: "wrap", borderBottom: "1px solid #F0F0F0" }}>
                  <span>{b.phone}</span>
                  {b.instagram && <span style={{ color: "#999" }}>{b.instagram}</span>}
                  <span style={{ fontWeight: 800, color: "#111", fontSize: 13 }}>${b.price}</span>
                  <span style={{ color: "#888" }}>{b.bookingType === "monthly" ? "Monthly" : "Drop-in"}</span>
                </div>
                <div style={{ padding: "10px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {b.status === "pending" && <StatusButton id={b.id} status="confirmed" label="✓ Confirm" bg="#1565C0" />}
                  {b.status === "confirmed" && <StatusButton id={b.id} status="paid" label="✓ Paid" bg="#2E7D32" />}
                  {b.status !== "cancelled" && <StatusButton id={b.id} status="cancelled" label="✕ Cancel" bg="#555" />}
                  <DeleteConfirmBtn id={b.id} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
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
          padding: "8px 14px", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.05em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "inherit", borderRadius: 2,
        }}
      >
        {label}
      </button>
    </form>
  );
}
