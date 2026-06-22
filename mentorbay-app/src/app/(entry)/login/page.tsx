"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoWordmark } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    let dest = "/account";
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role) dest = `/${profile.role}`;
    }
    router.push(dest);
    router.refresh();
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="cta-gradient hidden lg:flex flex-col justify-between p-12 text-white">
        <Link href="/"><LogoWordmark light /></Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">Welcome back.</h2>
          <p className="mt-3 text-teal-50/90 max-w-sm">Pick up where you left off - your mentor, programs, and progress are waiting.</p>

          <div className="mt-10 relative h-64 w-full max-w-sm" aria-hidden="true">
            <svg viewBox="0 0 320 260" className="w-full h-full">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#7fe7f5" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#7fe7f5" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="160" cy="130" r="120" fill="url(#glow)"><animate attributeName="r" values="110;125;110" dur="6s" repeatCount="indefinite" /></circle>
              <g stroke="#bdeef6" strokeWidth="1.5" strokeOpacity="0.5">
                <line x1="160" y1="130" x2="60" y2="60"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite" /></line>
                <line x1="160" y1="130" x2="270" y2="70"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="3.6s" repeatCount="indefinite" /></line>
                <line x1="160" y1="130" x2="50" y2="200"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="4.2s" repeatCount="indefinite" /></line>
                <line x1="160" y1="130" x2="265" y2="205"><animate attributeName="stroke-opacity" values="0.2;0.7;0.2" dur="3.3s" repeatCount="indefinite" /></line>
                <line x1="60" y1="60" x2="270" y2="70" strokeOpacity="0.25" />
                <line x1="50" y1="200" x2="265" y2="205" strokeOpacity="0.25" />
              </g>
              <circle cx="160" cy="130" r="30" fill="#1FA2BE" stroke="#ffffff" strokeWidth="2" />
              <text x="160" y="138" textAnchor="middle" fontSize="22" fontWeight="800" fill="#ffffff" fontFamily="Inter">M</text>
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
          <h1 className="text-2xl font-extrabold text-navy">Log in to MentorBay</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back - let&apos;s keep growing.</p>

          {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">{error}</p>}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Email address</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal focus:border-teal outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-navy">Password</label>
                <Link href="/forgot-password" className="text-xs text-teal-600 font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input value={password} onChange={(e) => setPassword(e.target.value)} required type={showPassword ? "text" : "password"} className="w-full px-4 py-3 pr-11 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal focus:border-teal outline-none" placeholder="Your password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-teal transition">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button disabled={loading} className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5"><span className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">or</span><span className="flex-1 h-px bg-slate-200" /></div>
          <button onClick={google} className="w-full py-3 border border-slate-200 rounded-lg font-semibold text-navy hover:border-teal transition">Continue with Google</button>
          <p className="text-center text-sm text-slate-500 mt-6">New to MentorBay? <Link href="/signup" className="text-teal-600 font-semibold hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
