"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoWordmark } from "@/components/Logo";

const INTERESTS = ["Technology", "Business", "Marketing", "Finance", "Design", "Data Science", "Leadership", "Entrepreneurship", "Career Development", "Public Speaking"];
const GOALS = [
  { t: "Land a new job", d: "Get hired in your target role" },
  { t: "Get promoted", d: "Grow in your current company" },
  { t: "Switch careers", d: "Move into a new field" },
  { t: "Build new skills", d: "Learn in-demand abilities" },
  { t: "Start a business", d: "Launch and grow a venture" },
  { t: "Grow my network", d: "Connect with the right people" },
];

export default function MenteeOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function finish() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ interests, goals, onboarded: true }).eq("id", user.id);
    router.push("/mentee");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <LogoWordmark />
          <button onClick={() => router.push("/account")} className="text-sm text-slate-400 hover:text-slate-600">Skip for now</button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {step} of 2</span>
            <span>{step === 1 ? "Your interests" : "Your goals"}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal transition-all" style={{ width: `${step * 50}%` }} /></div>
        </div>

        {step === 1 && (
          <section>
            <h1 className="text-2xl font-extrabold text-navy">What do you want to learn?</h1>
            <p className="text-slate-500 mt-1">Pick the areas you&apos;re most interested in.</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggle(interests, setInterests, i)} className={`px-4 py-2 rounded-full border text-sm font-medium transition ${interests.includes(i) ? "bg-teal text-white border-teal" : "border-slate-200 text-slate-600 hover:border-teal"}`}>{i}</button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="text-2xl font-extrabold text-navy">What are your goals?</h1>
            <p className="text-slate-500 mt-1">Select what you&apos;d like to achieve with mentorship.</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              {GOALS.map((g) => (
                <button key={g.t} onClick={() => toggle(goals, setGoals, g.t)} className={`text-left rounded-xl border-2 p-4 transition ${goals.includes(g.t) ? "border-teal bg-teal-50" : "border-slate-200 hover:border-teal"}`}>
                  <span className="block font-bold text-navy">{g.t}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{g.d}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between mt-10">
          <button onClick={() => setStep(1)} className={`px-5 py-2.5 text-slate-500 font-semibold rounded-lg hover:bg-slate-100 transition ${step === 1 ? "invisible" : ""}`}>← Back</button>
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="px-7 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition">Continue</button>
          ) : (
            <button onClick={finish} disabled={saving} className="px-7 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">{saving ? "Finishing..." : "Finish"}</button>
          )}
        </div>
      </main>
    </div>
  );
}
