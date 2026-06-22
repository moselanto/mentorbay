import type { EventItem } from "@/lib/data";

// Build a Google Calendar "add event" URL that opens the user's Google Calendar
// pre-filled (syncs to their Gmail calendar on save).
export function googleCalendarUrl(e: EventItem): string {
  const start = new Date(`${e.date} ${e.time || "9:00 AM"}`);
  const valid = !Number.isNaN(start.getTime());
  const s = valid ? start : new Date();
  const end = new Date(s.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${fmt(s)}/${fmt(end)}`,
    details: `MentorBay event - ${e.category}.${e.speaker ? " Speaker: " + e.speaker : ""}\nhttps://mentorbay.vercel.app/events/${e.id}`,
    location: e.loc || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
