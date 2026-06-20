"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { notifyAdminsOfSignupAction, sendWelcomeEmailAction } from "@/app/actions";
import { LogoWordmark } from "@/components/Logo";

type Role = "mentee" | "mentor";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("mentee");
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
        <Link href="/"><LogoWordmark /></Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight">Start your growth journey today.</h2>
          <p className="mt-3 text-teal-50/90 max-w-sm">Join thousands of mentees and mentors across Kenya and Africa. Free during launch.</p>
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
