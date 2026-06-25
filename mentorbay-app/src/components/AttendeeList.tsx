"use client";

import { useState } from "react";

type Attendee = {
  name: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
};

function csvCell(value: string | null): string {
  const v = (value ?? "").replace(/"/g, '""');
  return `"${v}"`;
}

function downloadAttendeesCsv(eventTitle: string, attendees: Attendee[]) {
  const header = ["Event", "Name", "Phone", "Email"];
  const rows = attendees.map((a) => [
    csvCell(eventTitle),
    csvCell(a.name),
    csvCell(a.phone),
    csvCell(a.email),
  ].join(","));
  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "event";
  a.href = url;
  a.download = `${safe}-attendees.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AttendeeList({ attendees = [], eventTitle = "Event" }: { attendees?: Attendee[]; eventTitle?: string }) {
  const [open, setOpen] = useState(false);
  if (attendees.length === 0) {
    return <p className="mt-2 text-xs text-slate-400">No one has registered yet.</p>;
  }
  return (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-teal-600 hover:underline">
          {open ? "Hide" : "View"} {attendees.length} attending
        </button>
        <button
          onClick={() => downloadAttendeesCsv(eventTitle, attendees)}
          className="text-xs font-semibold text-navy bg-slate-100 hover:bg-slate-200 transition px-2 py-0.5 rounded-lg"
        >
          Export CSV
        </button>
      </div>
      {open && (
        <ul className="mt-2 space-y-2">
          {attendees.map((a, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 grid place-items-center text-xs font-bold shrink-0">{a.name.charAt(0)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy truncate">{a.name}</p>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
                  {a.phone ? <a href={`tel:${a.phone}`} className="font-semibold text-teal-600 hover:underline">{a.phone}</a> : <span className="text-slate-400">No phone</span>}
                  {a.email ? <a href={`mailto:${a.email}`} className="font-semibold text-teal-600 hover:underline truncate">{a.email}</a> : <span className="text-slate-400">No email</span>}
                </div>
              </div>
              {a.userId ? (
                <a href={`/mentor/messages?with=${a.userId}`} className="text-[11px] font-semibold text-white bg-teal hover:bg-teal-600 transition px-2 py-0.5 rounded-lg shrink-0">Message</a>
              ) : (
                <span className="text-[11px] text-slate-300 shrink-0">-</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
