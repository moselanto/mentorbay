"use client";

import { useState } from "react";

type Enrollee = {
  name: string;
  pct: number;
  status: string;
  userId: string | null;
  phone: string | null;
  email: string | null;
};

function csvCell(value: string | null): string {
  const v = (value ?? "").replace(/"/g, '""');
  return `"${v}"`;
}

function downloadEnrolleesCsv(programTitle: string, enrollees: Enrollee[]) {
  const header = ["Program", "Name", "Phone", "Email", "Progress", "Status"];
  const rows = enrollees.map((e) => [
    csvCell(programTitle),
    csvCell(e.name),
    csvCell(e.phone),
    csvCell(e.email),
    csvCell(`${e.pct}%`),
    csvCell(e.status),
  ].join(","));
  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = programTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "program";
  a.href = url;
  a.download = `${safe}-enrollees.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function EnrolleeList({ enrollees, programTitle = "Program" }: { enrollees: Enrollee[]; programTitle?: string }) {
  const [open, setOpen] = useState(false);
  if (enrollees.length === 0) {
    return <p className="mt-3 text-xs text-slate-400">No enrollees yet.</p>;
  }
  return (
    <div className="mt-3">
      <div className="flex items-center gap-4">
        <button onClick={() => setOpen((v) => !v)} className="text-sm font-semibold text-teal-600 hover:underline">
          {open ? "Hide" : "View"} {enrollees.length} enrolled {enrollees.length === 1 ? "mentee" : "mentees"}
        </button>
        <button
          onClick={() => downloadEnrolleesCsv(programTitle, enrollees)}
          className="text-xs font-semibold text-navy bg-slate-100 hover:bg-slate-200 transition px-2.5 py-1 rounded-lg"
        >
          Export CSV
        </button>
      </div>
      {open && (
        <ul className="mt-3 space-y-2">
          {enrollees.map((e, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 grid place-items-center text-xs font-bold shrink-0">{e.name.charAt(0)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy truncate">{e.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                  {e.phone ? <a href={`tel:${e.phone}`} className="font-semibold text-teal-600 hover:underline">{e.phone}</a> : <span className="text-slate-400">No phone</span>}
                  {e.email ? <a href={`mailto:${e.email}`} className="font-semibold text-teal-600 hover:underline">{e.email}</a> : <span className="text-slate-400">No email</span>}
                </div>
              </div>
              <div className="w-24 shrink-0">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal" style={{ width: `${e.pct}%` }} /></div>
              </div>
              <span className="text-xs text-slate-500 w-16 text-right shrink-0">{e.status === "completed" ? "Completed" : `${e.pct}%`}</span>
              {e.userId ? (
                <a href={`/mentor/messages?with=${e.userId}`} className="text-xs font-semibold text-white bg-teal hover:bg-teal-600 transition px-2.5 py-1 rounded-lg shrink-0">Message</a>
              ) : (
                <span className="text-xs text-slate-300 shrink-0">-</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
