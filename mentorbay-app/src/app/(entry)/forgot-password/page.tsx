"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoWordmark } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account`,
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <Link href="/" className="inline-block mb-8"><LogoWordmark /></Link>
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 grid place-items-center mb-4">
              <svg className="w-7 h-7 text-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
            </div>
            <h1 className="text-xl font-extrabold text-navy">Check your inbox</h1>
            <p className="text-slate-500 text-sm mt-2">If an account exists for that email, we&apos;ve sent a password reset link.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-navy">Reset your password</h1>
            <p className="text-slate-500 text-sm mt-1">Enter your email and we&apos;ll send you a reset link.</p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Email address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal focus:border-teal outline-none" placeholder="you@example.com" />
              </div>
              <button disabled={loading} className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}
        <p className="text-center text-sm text-slate-500 mt-6"><Link href="/login" className="text-teal-600 font-semibold hover:underline">← Back to login</Link></p>
      </div>
    </div>
  );
}
