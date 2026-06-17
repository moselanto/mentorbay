import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LogoWordmark } from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = { title: "My Account — MentorBay" };

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const role = (profile?.role as string) ?? "mentee";
  const name = (profile?.full_name as string) ?? user.email;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><LogoWordmark /></Link>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full capitalize">{role}</span>
          <h1 className="text-2xl font-extrabold text-navy mt-3">Welcome, {name}!</h1>
          <p className="text-slate-500 mt-1">You&apos;re signed in to MentorBay. This is your account hub.</p>

          <dl className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
            <div className="bg-slate-50 rounded-xl p-4"><dt className="text-slate-400">Email</dt><dd className="font-semibold text-navy mt-0.5">{user.email}</dd></div>
            <div className="bg-slate-50 rounded-xl p-4"><dt className="text-slate-400">Role</dt><dd className="font-semibold text-navy mt-0.5 capitalize">{role}</dd></div>
            <div className="bg-slate-50 rounded-xl p-4"><dt className="text-slate-400">Onboarding</dt><dd className="font-semibold text-navy mt-0.5">{profile?.onboarded ? "Complete" : "Pending"}</dd></div>
            <div className="bg-slate-50 rounded-xl p-4"><dt className="text-slate-400">User ID</dt><dd className="font-mono text-xs text-slate-500 mt-0.5 truncate">{user.id}</dd></div>
          </dl>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/mentors" className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Browse Mentors</Link>
            <Link href="/programs" className="px-5 py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Explore Programs</Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          This account hub is the entry point for your full dashboard. The Mentee / Mentor / Admin dashboards
          (already designed) get wired up next - protected by the same auth.
        </p>
      </main>
    </div>
  );
}
