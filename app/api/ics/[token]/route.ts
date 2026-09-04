import { NextRequest, NextResponse } from "next/server";
import { getBookingByToken } from "@/app/actions/manageBooking";
import { buildIcsFile } from "@/lib/calendar";

const CLASS_LABELS: Record<string, string> = { twerk: "Twerk", highheels: "High Heels" };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getBookingByToken(token);
  if (!data?.session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { booking, session } = data;
  const classLabel = CLASS_LABELS[session.classType] ?? session.classType;

  const ics = buildIcsFile({
    uid: `booking-${booking.id}`,
    title: `${classLabel} @ bounce lab`,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    details: "Booked via bounce-lab.com",
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="bounce-lab-${classLabel.toLowerCase()}.ics"`,
    },
  });
}
