"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toWebp } from "@/lib/image-to-webp";

export default function AvatarUpload({ currentUrl }: { currentUrl: string | null }) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) return;
    setBusy(true);
    setErr("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErr("Please log in again."); return; }
      const file = await toWebp(original, 512);
      const ext = file.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) { setErr(upErr.message); return; }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (dbErr) { setErr(dbErr.message); return; }
      setUrl(publicUrl);
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-bold text-navy mb-4">Profile photo</h3>
      <div className="flex items-center gap-5">
        <span className="w-20 h-20 rounded-full bg-teal-50 text-teal-700 grid place-items-center text-2xl font-bold overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="Your avatar" className="w-full h-full object-cover" /> : "?"}
        </span>
        <div>
          <label className="inline-block px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-navy-700 transition">
            {busy ? "Uploading..." : "Upload photo"}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
          </label>
          <p className="text-xs text-slate-400 mt-2">JPG or PNG. Saved to your profile right away.</p>
          {err && <p className="text-xs text-rose-600 mt-1">{err}</p>}
        </div>
      </div>
    </section>
  );
}
