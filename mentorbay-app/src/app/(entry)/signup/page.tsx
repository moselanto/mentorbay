"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { notifyAdminsOfSignupAction, sendWelcomeEmailAction } from "@/app/actions";
import { LogoWordmark } from "@/components/Logo";

type Role = "mentee" | "mentor";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole: Role = params.get("role") === "mentor" ? "mentor" : "mentee";
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/${role}`,
      },
    });
    if (error) {
      console.error("Sign-up error:", error);
      setError(
        error.message ||
          "Sign-up failed. Check your browser console and your Supabase Auth logs for the exact reason."
      );
      setLoading(false);
      return;
    }
    if (role === "mentor") {
      try { await notifyAdminsOfSignupAction({ name, email, role }); } catch { /* best-effort */ }
    }
    try { await sendWelcomeEmailAction({ name, email, role }); } catch { /* best-effort */ }
    // If email confirmation is OFF, a session is returned and we can go straight to onboarding.
    if (data.session) {
      router.push(`/onboarding/${role}`);
      router.refresh();
    } else {
      setCheckEmail(true);
      setLoading(false);
    }
  }

  const roleBtn = (r: Role, title: string, sub: string) => (
    <button
      type="button"
      onClick={() => setRole(r)}
      className={`rounded-xl border-2 p-4 text-left transition ${role === r ? "border-teal bg-teal-50" : "border-slate-200"}`}
    >
      <span className="block font-bold text-navy">{title}</span>
      <span className="block text-xs text-slate-500 mt-0.5">{sub}</span>
    </button>
  );

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="cta-gradient hidden lg:flex flex-col justify-between p-12 text-white">
        <Link href="/"><LogoWordmark light /></Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">Start your growth journey today.</h2>
          <p className="mt-3 text-teal-50/90 max-w-sm">Join thousands of mentees and mentors across Kenya and Africa. Free during launch.</p>

          {/* Animated mentorship-network visual */}
          <div className="mt-10 relative h-64 w-full max-w-sm" aria-hidden="true">
            <svg viewBox="0 0 320 260" className="w-full h-full">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#7fe7f5" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#7fe7f5" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="160" cy="130" r="120" fill="url(#glow)">
                <animate attributeName="r" values="110;125;110" dur="6s" repeatCount="indefinite" />
              </circle>

              {/* connecting lines */}
              <g stroke="#bdeef6" strokeWidth="1.5" strokeOpacity="0.5">
                <line x1="160" y1="130" x2="60" y2="60"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite" /></line>
                <line x1="160" y1="130" x2="270" y2="70"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="3.6s" repeatCount="indefinite" /></line>
                <line x1="160" y1="130" x2="50" y2="200"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="4.2s" repeatCount="indefinite" /></line>
                <line x1="160" y1="130" x2="265" y2="205"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="3.3s" repeatCount="indefinite" /></line>
                <line x1="60" y1="60" x2="270" y2="70" strokeOpacity="0.25" />
                <line x1="50" y1="200" x2="265" y2="205" strokeOpacity="0.25" />
              </g>

              {/* center mentor node */}
              <circle cx="160" cy="130" r="30" fill="#1FA2BE" stroke="#ffffff" strokeWidth="2" />
              <text x="160" y="138" textAnchor="middle" fontSize="22" fontWeight="800" fill="#ffffff" fontFamily="Inter">M</text>

              {/* mentee nodes (gently pulsing) */}
              <g fill="#ffffff">
                <circle cx="60" cy="60" r="14"><animate attributeName="r" values="12;15;12" dur="2.8s" repeatCount="indefinite" /></circle>
                <circle cx="270" cy="70" r="14"><animate attributeName="r" values="13;16;13" dur="3.4s" repeatCount="indefinite" /></circle>
                <circle cx="50" cy="200" r="14"><animate attributeName="r" values="14;11;14" dur="3.1s" repeatCount="indefinite" /></circle>
                <circle cx="265" cy="205" r="14"><animate attributeName="r" values="12;15;12" dur="3.7s" repeatCount="indefinite" /></circle>
              </g>
            </svg>
          </div>
        </div>
        <p className="text-xs text-teal-50/60">© 2026 MentorBay · Connect · Grow · Succeed</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden inline-block mb-8"><LogoWordmark /></Link>

          {checkEmail ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 grid place-items-center mb-4">
                <svg className="w-7 h-7 text-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
              </div>
              <h1 className="text-xl font-extrabold text-navy">Check your inbox</h1>
              <p className="text-slate-500 text-sm mt-2">We sent a confirmation link to <span className="font-semibold text-navy">{email}</span>. Click it to finish creating your account.</p>
              <Link href="/login" className="inline-block mt-6 text-sm text-teal-600 font-semibold hover:underline">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-navy">Create your account</h1>
              <p className="text-slate-500 text-sm mt-1">It&apos;s free to get started.</p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {roleBtn("mentee", "Join as Mentee", "Learn & grow with a mentor")}
                {roleBtn("mentor", "Become a Mentor", "Share your expertise")}
              </div>
              {role === "mentor" && <p className="text-xs text-slate-400 mt-2">Mentor applications are reviewed before going live (usually within 48 hours).</p>}

              {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">{error}</p>}

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required type="text" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal focus:border-teal outline-none" placeholder="Moses Njeru" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Email address</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal focus:border-teal outline-none" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Password</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} type="password" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal focus:border-teal outline-none" placeholder="At least 6 characters" />
                </div>
                <button disabled={loading} className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
                <p className="text-center text-xs text-slate-400 leading-relaxed">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-teal-600 font-medium hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-teal-600 font-medium hover:underline">Privacy Policy</Link>.
                </p>
              </form>
              <p className="text-center text-sm text-slate-500 mt-6">Already have an account? <Link href="/login" className="text-teal-600 font-semibold hover:underline">Log in</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
