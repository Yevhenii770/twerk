import Navigation from "@/components/Navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light-page" style={{ minHeight: "100vh", background: "#fff", color: "#111" }}>
      <Navigation />
      <main className="pl-16 md:pl-64 pt-0 min-h-screen" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
