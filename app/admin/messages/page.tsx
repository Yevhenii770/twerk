import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getContactMessages } from "@/lib/dal";

export default async function AdminMessagesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const messages = await getContactMessages();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "inherit" }}>
      <div style={{ borderBottom: "2px solid #111", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 4 }}>bounce lab</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#fff" }}>Contact Messages</h1>
        </div>
        <Link href="/admin" style={{ fontSize: 12, color: "#CCC", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>← Bookings</Link>
      </div>

      <div className="p-4 md:p-8" style={{ maxWidth: 760 }}>
        {messages.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>No messages yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {messages.map(m => (
              <div key={m.id} style={{ border: "1px solid #E0E0E0", padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{m.name} · {m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                  <span style={{ fontSize: 11, color: "#888" }}>{new Date(m.createdAt).toLocaleString("en-US")}</span>
                </div>
                {m.inquiryType && <p style={{ fontSize: 11, color: "#C9A96E", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{m.inquiryType}</p>}
                <p style={{ fontSize: 13, color: "#333", whiteSpace: "pre-wrap" }}>{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
