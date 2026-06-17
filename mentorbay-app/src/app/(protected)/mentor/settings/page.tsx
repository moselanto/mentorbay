import { createClient } from "@/lib/supabase/server";
import { updateProfileAction } from "@/app/actions";

export default async function MentorSettingsPage({ searchParams }: { searchParams: { saved?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id ?? "").maybeSingle();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Settings</h1>
      {searchParams.saved && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Your profile has been saved.</p>}

      <form action={updateProfileAction} className="space-y-6">
        <input type="hidden" name="redirect" value="/mentor/settings" />
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">Mentor profile</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Full name</label><input name="full_name" defaultValue={profile?.full_name ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Your name" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Professional title</label><input name="title" defaultValue={profile?.title ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Senior Software Engineer" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Bio</label><textarea name="bio" defaultValue={profile?.bio ?? ""} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Tell mentees about your experience" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-navy mb-1">Location</label><input name="location" defaultValue={profile?.location ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Nairobi, Kenya" /></div>
              <div><label className="block text-sm font-semibold text-navy mb-1">Languages</label><input name="languages" defaultValue={profile?.languages ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="English, Swahili" /></div>
            </div>
          </div>
        </section>
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save changes</button>
        </div>
      </form>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Availability</h3>
        <label className="flex items-center justify-between text-sm"><span className="text-slate-600">Accepting new mentees</span><input type="checkbox" defaultChecked={profile?.accepting_mentees ?? true} className="w-5 h-5 accent-teal" /></label>
        <p className="text-xs text-slate-400 mt-4">Availability toggle is presentational for now.</p>
      </section>
    </div>
  );
}
