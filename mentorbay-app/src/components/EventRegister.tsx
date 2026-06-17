"use client";

import { useState } from "react";
import type { EventItem } from "@/lib/data";

// Decorative QR (real scannable codes are generated server-side later).
function FakeQR() {
  const N = 25, size = 140, m = size / N;
  const rects: React.ReactElement[] = [];
  let seed = 20260625;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if ((x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9)) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if ((seed >> 9) % 2 === 0) rects.push(<rect key={`${x}-${y}`} x={x * m} y={y * m} width={m} height={m} fill="#0B2A4A" />);
    }
  }
  const finder = (fx: number, fy: number) => (
    <g key={`f${fx}-${fy}`}>
      <rect x={fx * m} y={fy * m} width={7 * m} height={7 * m} fill="#0B2A4A" />
      <rect x={(fx + 1) * m} y={(fy + 1) * m} width={5 * m} height={5 * m} fill="#fff" />
      <rect x={(fx + 2) * m} y={(fy + 2) * m} width={3 * m} height={3 * m} fill="#0B2A4A" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-32 h-32">
      <rect width={size} height={size} fill="#fff" />
      {rects}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}

export default function EventRegister({ event }: { event: EventItem }) {
  const [registered, setRegistered] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-24">
      <div className="flex items-end gap-2">
        <span className="text-3xl font-extrabold text-navy">Free</span>
        <span className="text-sm text-slate-400 mb-1">· entry</span>
      </div>
      <p className="text-xs text-teal-600 font-medium mt-1">Only 30 spots left of {event.going + 30}</p>
      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex items-center gap-3"><span className="text-teal">📅</span><span>{event.date}</span></li>
        <li className="flex items-center gap-3"><span className="text-teal">🕘</span><span>{event.time} EAT</span></li>
        <li className="flex items-center gap-3"><span className="text-teal">📍</span><span>{event.loc}</span></li>
      </ul>

      <button
        onClick={() => setRegistered((v) => !v)}
        className={`w-full mt-5 py-3 text-white font-semibold rounded-lg transition ${registered ? "bg-teal hover:bg-teal-600" : "bg-navy hover:bg-navy-700"}`}
      >
        {registered ? "Registered ✓" : "Register Now"}
      </button>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button className="py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal hover:text-teal transition">Add to Calendar</button>
        <button className="py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal hover:text-teal transition">Share</button>
      </div>

      {registered && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="rounded-xl border-2 border-dashed border-teal/40 bg-teal-50/40 p-4 text-center">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Your Ticket</p>
            <div className="flex justify-center my-3"><FakeQR /></div>
            <p className="text-sm font-bold text-navy">MentorBay · {event.id.toUpperCase().slice(0, 8)}</p>
            <p className="text-xs text-slate-500">Ticket #MB-{event.day}{event.mon}-0142</p>
            <p className="text-xs text-slate-400 mt-1">Present this QR at the entrance</p>
          </div>
          <p className="text-xs text-center text-teal-600 mt-3 font-medium">✓ You&apos;re registered! A reminder will be emailed before the event.</p>
        </div>
      )}
    </div>
  );
}
