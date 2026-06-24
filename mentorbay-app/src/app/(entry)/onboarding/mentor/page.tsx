"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoWordmark } from "@/components/Logo";

const EXPERTISE = ["Technology", "Software Engineering", "Product", "Data Science", "Business Strategy", "Marketing", "Finance", "Design", "Leadership", "Entrepreneurship", "HR & People", "Sales"];
const EXPERIENCE = ["3-5 years", "6-10 years", "11-15 years", "15+ years"];
// Map the experience range to a stored number (lower bound) for experience_years.
const EXP_YEARS: Record<string, number> = { "3-5 years": 3, "6-10 years": 6, "11-15 years": 11, "15+ years": 15 };

export default function MentorOnboarding() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [experience, setExperience] = useState(EXPERIENCE[0]);
  const [location, setLocation] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = (v: string) => setExpertise((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Your session expired. Please log in again."); setSaving(false); return; }
    const { error: saveErr } = await supabase.from("profiles").update({
      title: title.trim() || null,
      experience_years: EXP_YEARS[experience] ?? 0,
      location: location.trim() || null,
      interests: expertise,            // expertise syncs into mentors.skills on approval
      bio: bio.trim() || null,
      headline: linkedin.trim() || null,
      onboarded: true,
    }).eq("id", user.id);
    if (saveErr) { setError("Could not save your details. Please try again."); setSaving(false); return; }
    setSubmitted(true);
    setSaving(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <LogoWordmark />
          <Link href="/account" className="text-sm text-slate-400 hover:text-slate-600">Save &amp; exit</Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        {submitted ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-teal-50 grid place-items-center mb-4">
              <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
            </div>
            <h1 className="text-2xl font-extrabold text-navy">Application submitted!</h1>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Thanks for applying to mentor on MentorBay. Our team reviews applications within 48 hours - we&apos;ll email you once your profile is approved and live.</p>
            <Link href="/mentor" className="inline-block mt-6 px-7 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition">Go to my dashboard</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <h1 className="text-2xl font-extrabold text-navy">Mentor application</h1>
              <p className="text-slate-500 mt-1">Tell us about your professional background.</p>
              {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">{error}</p>}
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="sm:col-span-2"><label className="block text-sm font-semibold text-navy mb-1">Professional title</label><input value={title} onChange={(e) => setTitle(e.target.value)} required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Senior Software Engineer" /></div>
                <div><label className="block text-sm font-semibold text-navy mb-1">Years of experience</label><select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">{EXPERIENCE.map((x) => <option key={x}>{x}</option>)}</select></div>
                <div><label className="block text-sm font-semibold text-navy mb-1">Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Nairobi, Kenya" /></div>
              </div>
              <label className="block text-sm font-semibold text-navy mt-4 mb-2">Areas of expertise</label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE.map((x) => (
                  <button type="button" key={x} onClick={() => toggle(x)} className={`px-4 py-2 rounded-full border text-sm font-medium transition ${expertise.includes(x) ? "bg-teal text-white border-teal" : "border-slate-200 text-slate-600 hover:border-teal"}`}>{x}</button>
                ))}
              </div>
              <div className="mt-5"><label className="block text-sm font-semibold text-navy mb-1">Short bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Tell mentees about your experience and how you can help..." /></div>
              <div className="mt-4"><label className="block text-sm font-semibold text-navy mb-1">LinkedIn profile</label><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} type="url" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="https://linkedin.com/in/..." /></div>
            </div>
            <button disabled={saving} className="px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">{saving ? "Submitting..." : "Submit Application"}</button>
          </form>
        )}
      </main>
    </div>
  );
}
