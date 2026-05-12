import { getCurrentUser, getAllBookings } from "@/lib/dal";
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (user.role !== "admin") redirect("/");

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

  const active = filterStatus || "all";

  return (
    <div style={{ color: "#111" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 4 }}>bounce lab</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#111" }}>Bookings</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#DDD", marginBottom: 24, border: "1px solid #DDD" }}>
        {[
          { label: "Total",     value: counts.all,       bg: "#111",    text: "#fff" },
          { label: "Pending",   value: counts.pending,   bg: "#FFF3CD", text: "#7A4F00" },
          { label: "Confirmed", value: counts.confirmed, bg: "#CCE5FF", text: "#003D80" },
          { label: "Paid",      value: counts.paid,      bg: "#D4EDDA", text: "#155724" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px 24px", background: s.bg }}>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: s.text, marginBottom: 4, opacity: 0.7 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: s.text, margin: 0, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #111", marginBottom: 20, background: "#F5F5F5", overflowX: "auto" }}>
        {[
          { key: "all",       label: "All",       count: counts.all },
          { key: "pending",   label: "Pending",   count: counts.pending },
          { key: "confirmed", label: "Confirmed", count: counts.confirmed },
          { key: "paid",      label: "Paid",      count: counts.paid },
          { key: "cancelled", label: "Cancelled", count: counts.cancelled },
        ].map(t => (
          <Link
            key={t.key}
            href={`/dashboard?status=${t.key}`}
            style={{
              padding: "12px 20px",
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ color: "#666", fontSize: 14, padding: "32px 0", textAlign: "center" }}>
          No bookings yet.{" "}
          <Link href="/book" style={{ color: "#C9A96E" }}>Share booking link →</Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #111", background: "#F5F5F5" }}>
                {["Date", "Class", "Name", "Phone", "Email", "Type", "Price", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", fontWeight: 800 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #E0E0E0", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px", color: "#111", whiteSpace: "nowrap", fontWeight: 500 }}>
                    {new Date(b.date + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ color: "#111", fontWeight: 700 }}>{CLASS_LABELS[b.classType] || b.classType}</span>
                  </td>
                  <td style={{ padding: "12px", color: "#111", fontWeight: 700 }}>{b.name}</td>
                  <td style={{ padding: "12px", color: "#333" }}>{b.phone}</td>
                  <td style={{ padding: "12px", color: b.email ? "#333" : "#AAA" }}>{b.email ?? "—"}</td>
                  <td style={{ padding: "12px", color: "#333" }}>
                    {b.bookingType === "monthly" ? "Monthly" : "Drop-in"}
                  </td>
                  <td style={{ padding: "12px", color: "#111", fontWeight: 800, fontSize: 15 }}>${b.price}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      background: STATUS_STYLE[b.status]?.bg || "#EEE",
                      color: STATUS_STYLE[b.status]?.color || "#333",
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.15)",
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {b.status === "pending" && (
                        <ActionBtn id={b.id} status="confirmed" label="✓ Confirm" bg="#1565C0" />
                      )}
                      {b.status === "confirmed" && (
                        <ActionBtn id={b.id} status="paid" label="✓ Paid" bg="#2E7D32" />
                      )}
                      {b.status !== "cancelled" && b.status !== "paid" && (
                        <ActionBtn id={b.id} status="cancelled" label="✕ Cancel" bg="#555" />
                      )}
                      <DeleteConfirmBtn id={b.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ id, status, label, bg }: {
  id: number; status: string; label: string; bg: string
}) {
  return (
    <form action={async () => { "use server"; await updateBookingStatus(id, status); }}>
      <button
        type="submit"
        style={{
          background: bg,
          color: "#fff",
          border: "none",
          padding: "7px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
          borderRadius: 2,
        }}
      >
        {label}
      </button>
    </form>
  );
}
