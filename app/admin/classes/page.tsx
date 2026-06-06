import { getCurrentUser, getClassSettings } from "@/lib/dal";
import { redirect } from "next/navigation";
import { CLASS_STATIC, CLASS_IDS } from "@/lib/classes";
import Link from "next/link";
import FocalPointPicker from "./FocalPointPicker";
import TextEditor from "./TextEditor";

export default async function AdminClassesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  const settings = await getClassSettings();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111", fontFamily: "inherit" }}>
      <div style={{ background: "#111", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 4 }}>bounce lab</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#fff" }}>Class Content</h1>
        </div>
        <Link href="/admin" style={{ fontSize: 12, color: "#fff", textDecoration: "none", border: "1px solid #555", padding: "6px 14px" }}>
          ← Admin
        </Link>
      </div>

      <div style={{ padding: "32px", maxWidth: 960 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {CLASS_IDS.map(id => {
            const cls = CLASS_STATIC[id];
            const s = settings[id];
            return (
              <div key={id} style={{ border: "1px solid #E0E0E0", padding: 20 }}>
                <FocalPointPicker
                  classId={id}
                  label={cls.label}
                  photo={s?.photoUrl ?? cls.photo}
                  initial={s?.photoPosition ?? "50% 50%"}
                />
                <TextEditor
                  classId={id}
                  label={cls.label}
                  initialDesc={s?.desc ?? cls.desc}
                  initialModalTexts={s?.modalTexts ?? cls.modalTexts}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
