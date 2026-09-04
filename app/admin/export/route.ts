import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/dal";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const rows = await db.select().from(bookings).orderBy(desc(bookings.date));

  const headers = ["id", "name", "email", "phone", "classType", "date", "status", "price", "amountPaidCents", "bookingType", "createdAt"];
  const lines = [
    headers.join(","),
    ...rows.map(r => headers.map(h => csvEscape(r[h as keyof typeof r])).join(",")),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
