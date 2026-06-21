import { createProgramAction } from "@/app/actions";
import CoverUpload from "@/components/CoverUpload";
import CurriculumBuilder from "@/components/CurriculumBuilder";
import CategorySelect from "@/components/CategorySelect";
import LearnEditor from "@/components/LearnEditor";

const DURATIONS = ["1 day", "2 days", "3 days", "1 week", "2 weeks", "4 weeks", "6 weeks", "8 weeks", "12 weeks"];

export default function CreateProgramPage({ searchParams }: { searchParams: { error?: string } }) {
  const pending = searchParams.error === "pending";
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Create a Program</h1>
      <p className="text-slate-500 -mt-3">Programs are reviewed by an admin before they go live publicly.</p>

      {pending && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Your mentor account is still pending approval, so you can&apos;t submit programs yet.</p>}
      {searchParams.error === "title" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please enter a program title.</p>}
      {searchParams.error === "save" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Something went wrong. Please try again.</p>}

      <form action={createProgramAction} className="space-y-6">
        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <CoverUpload name="cover_url" label="Program banner (cover image)" />
          <div><label className="block text-sm font-semibold text-navy mb-1">Program title</label><input name="title" required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Leadership Foundations" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <CategorySelect />
            <div><label className="block text-sm font-semibold text-navy mb-1">Level</label><select name="level" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Duration</label><select name="duration" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">{DURATIONS.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Number of lessons</label><input name="lessons" type="number" min={1} defaultValue={6} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Short tagline</label><input name="description" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="One sentence shown on the program card" /></div>
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">About this program</label><textarea name="about" rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Describe what this program is about and who it is for." /></div>
          <LearnEditor />
          <CurriculumBuilder name="curriculum" />
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Requirements</label>
            <textarea name="requirements" rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder={"One requirement per line, e.g.\nA laptop with internet\nBasic spreadsheet skills"} />
            <p className="text-xs text-slate-400 mt-1">One requirement per line (leave blank if none).</p>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Submit for approval</button>
        </div>
      </form>
    </div>
  );
}
