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
        <Link href="/"><LogoWordmark /></Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">Welcome back.</h2>
          <p className="mt-3 text-teal-50/90 max-w-sm">Pick up where you left off - your mentor, programs, and progress are waiting.</p>
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
