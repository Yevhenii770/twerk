const STUDIO_ADDRESS = "2648 E Burnside St, Portland, OR 97214";

function toIcsDate(date: string, time: string): string {
  // date: "2026-09-04", time: "18:00" (studio-local; treated as floating local time)
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

export function buildGoogleCalendarUrl(params: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  details: string;
}): string {
  const dates = `${toIcsDate(params.date, params.startTime)}/${toIcsDate(params.date, params.endTime)}`;
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", dates);
  url.searchParams.set("details", params.details);
  url.searchParams.set("location", STUDIO_ADDRESS);
  return url.toString();
}

export function buildIcsFile(params: {
  uid: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  details: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//bounce lab//booking//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${params.uid}@bounce-lab.com`,
    `DTSTAMP:${toIcsDate(new Date().toISOString().split("T")[0], "00:00")}Z`,
    `DTSTART:${toIcsDate(params.date, params.startTime)}`,
    `DTEND:${toIcsDate(params.date, params.endTime)}`,
    `SUMMARY:${escapeIcs(params.title)}`,
    `DESCRIPTION:${escapeIcs(params.details)}`,
    `LOCATION:${escapeIcs(STUDIO_ADDRESS)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function escapeIcs(text: string): string {
  return text.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

export const STUDIO_ADDRESS_DISPLAY = STUDIO_ADDRESS;
export const STUDIO_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO_ADDRESS)}`;
