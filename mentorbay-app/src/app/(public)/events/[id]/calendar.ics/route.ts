import { getEvent } from "@/lib/events";

// Generates a downloadable .ics calendar invite for an event.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const e = await getEvent(params.id);
  if (!e) return new Response("Not found", { status: 404 });

  // Best-effort parse of the event date/time into a start; default to a 2h block.
  const start = new Date(`${e.date} ${e.time || "9:00 AM"}`);
  const valid = !Number.isNaN(start.getTime());
  const s = valid ? start : new Date();
  const end = new Date(s.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const esc = (t: string) => (t || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MentorBay//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@mentorbay`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(s)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(e.loc)}`,
    `DESCRIPTION:${esc(`MentorBay event - ${e.category}. ${e.speaker ? "Speaker: " + e.speaker : ""}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.id}.ics"`,
    },
  });
}
