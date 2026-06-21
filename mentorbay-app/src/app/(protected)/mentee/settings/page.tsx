import { createClient } from "@/lib/supabase/server";
import { updateProfileAction } from "@/app/actions";
import AvatarUpload from "@/components/AvatarUpload";
import ChipMultiSelect from "@/components/ChipMultiSelect";
import { getPrograms } from "@/lib/programs";
import Link from "next/link";

export default async function MenteeSettingsPage({ searchParams }: { searchParams: { saved?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id ?? "").maybeSingle();

  const INTERESTS = ["Technology", "Business", "Marketing", "Finance", "Design", "Data Science", "Leadership", "Entrepreneurship", "Career Development", "Public Speaking"];
  const GOALS = ["Land a new job", "Get promoted", "Switch careers", "Build new skills", "Start a business", "Grow my network"];
  const myInterests: string[] = profile?.interests ?? [];
  const programs = await getPrograms();
  const wanted = new Set(myInterests.map((x) => x.toLowerCase()));
  const matched = wanted.size
    ? programs.filter((pr) => wanted.has((pr.category ?? "").toLowerCase()) || (pr.title ?? "").toLowerCase().split(" ").some((w) => wanted.has(w))).slice(0, 6)
    : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Settings</h1>
      {searchParams.saved && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Your profile has been saved.</p>}

      <AvatarUpload currentUrl={profile?.avatar_url ?? null} />

      <form action={updateProfileAction} className="space-y-6">
        <input type="hidden" name="redirect" value="/mentee/settings" />
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">Profile</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Full name</label><input name="full_name" defaultValue={profile?.full_name ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Your name" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Headline</label><input name="headline" defaultValue={profile?.headline ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Aspiring product manager" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Location</label><input name="location" defaultValue={profile?.location ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Nairobi, Kenya" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Bio</label><textarea name="bio" defaultValue={profile?.bio ?? ""} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Tell mentors about yourself" /></div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-1">Your interests</h3>
          <p className="text-xs text-slate-500 mb-4">We use these to recommend programs that match your interests.</p>
          <ChipMultiSelect name="interests" options={INTERESTS} initial={profile?.interests ?? []} />
          <h3 className="font-bold text-navy mt-6 mb-4">Your goals</h3>
          <ChipMultiSelect name="goals" options={GOALS} initial={profile?.goals ?? []} />
        </section>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save changes</button>
        </div>
      </form>

      {matched.length > 0 && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-1">Recommended for you</h3>
          <p className="text-xs text-slate-500 mb-4">Programs matched to your interests.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {matched.map((pr) => (
              <Link key={pr.id} href={`/programs/${pr.id}`} className="rounded-xl border border-slate-100 p-4 hover:border-teal transition block">
                <p className="font-semibold text-navy text-sm">{pr.title}</p>
                <p className="text-xs text-slate-500 mt-1">{pr.category} · {pr.level}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Notifications</h3>
        <div className="space-y-3">
          {["Session reminders", "New messages", "Program updates", "Weekly progress digest"].map((n, i) => (
            <label key={n} className="flex items-center justify-between text-sm"><span className="text-slate-600">{n}</span><input type="checkbox" defaultChecked={i < 3} className="w-5 h-5 accent-teal" /></label>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">Notification preferences are presentational for now.</p>
      </section>
    </div>
  );
}
