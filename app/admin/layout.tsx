import Navigation from "@/components/Navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>
      <Navigation />
      <main className="md:pl-64 pb-16 md:pb-0 min-h-screen" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
