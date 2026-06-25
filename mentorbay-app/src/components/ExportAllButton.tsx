"use client";

// A generic "Export all" button. Receives pre-built rows (already flattened
// server-side) plus a header and filename, and downloads a single CSV.
export default function ExportAllButton({
  header,
  rows,
  filename,
  label = "Export all (CSV)",
  emptyMessage = "Nothing to export yet.",
}: {
  header: string[];
  rows: (string | null)[][];
  filename: string;
  label?: string;
  emptyMessage?: string;
}) {
  function csvCell(value: string | null): string {
    const v = (value ?? "").replace(/"/g, '""');
    return `"${v}"`;
  }

  function download() {
    if (rows.length === 0) {
      alert(emptyMessage);
      return;
    }
    const lines = [header.map(csvCell).join(",")];
    for (const r of rows) lines.push(r.map(csvCell).join(","));
    const csv = lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="px-4 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition"
    >
      {label}
    </button>
  );
}
