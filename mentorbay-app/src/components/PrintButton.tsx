"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">
      Print / Save PDF
    </button>
  );
}
