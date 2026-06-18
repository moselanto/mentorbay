"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CoverUpload({ name, label = "Banner image", currentUrl = "" }: { name: string; label?: string; currentUrl?: string }) {
  const [url, setUrl] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErr("Please log in again."); return; }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/covers/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) { setErr(upErr.message); return; }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      setUrl(pub.publicUrl);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="w-32 h-20 rounded-lg bg-slate-100 overflow-hidden grid place-items-center text-slate-400 text-xs shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="Banner preview" className="w-full h-full object-cover" /> : "No banner"}
        </div>
        <label className="inline-block px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-navy-700 transition">
          {busy ? "Uploading..." : "Upload banner"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
        </label>
      </div>
      {err && <p className="text-xs text-rose-600 mt-1">{err}</p>}
    </div>
  );
}
