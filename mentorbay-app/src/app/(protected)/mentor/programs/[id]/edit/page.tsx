import { notFound } from "next/navigation";
import { getMyProgramBySlug } from "@/lib/programs";
import { updateProgramAction } from "@/app/actions";
import CoverUpload from "@/components/CoverUpload";
import CurriculumBuilder from "@/components/CurriculumBuilder";

const DURATIONS = ["1 day", "2 days", "3 days", "1 week", "2 weeks", "4 weeks", "6 weeks", "8 weeks", "12 weeks"];

export default async function EditProgramPage({ params }: { params: { id: string } }) {
  const p = await getMyProgramBySlug(params.id);
  if (!p) notFound();

  const learnText = (p.learn ?? []).join("\n");
  const requirementsText = (p.requirements ?? []).join("\n");
  const duration = p.durationLabel ?? `${p.weeks} weeks`;
  const durationOptions = DURATIONS.includes(duration) ? DURATIONS : [duration, ...DURATIONS];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Edit Program</h1>
      <p className="text-slate-500 -mt-3">Update your program details. Changes save immediately.</p>

      <form action={updateProgramAction} className="space-y-6">
        <input type="hidden" name="slug" value={p.id} />
        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <CoverUpload name="cover_url" label="Program banner (cover image)" currentUrl={p.img} />
          <div><label className="block text-sm font-semibold text-navy mb-1">Program title</label><input name="title" required defaultValue={p.title} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Category</label><select name="category" defaultValue={p.category} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Leadership</option><option>Technology</option><option>Business</option><option>Marketing</option><option>Finance</option><option>Design</option><option>Data</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Level</label><select name="level" defaultValue={p.level} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Duration</label><select name="duration" defaultValue={duration} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">{durationOptions.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Number of lessons</label><input name="lessons" type="number" min={1} defaultValue={p.lessons} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Short tagline</label><input name="description" defaultValue={p.description} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">About this program</label><textarea name="about" rows={4} defaultValue={p.about ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          <div><label className="block text-sm font-semibold text-navy mb-1">What you&apos;ll learn</label><textarea name="learn" rows={5} defaultValue={learnText} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /><p className="text-xs text-slate-400 mt-1">One learning outcome per line.</p></div>
          <CurriculumBuilder name="curriculum" initial={p.curriculum ?? []} />
          <div><label className="block text-sm font-semibold text-navy mb-1">Requirements</label><textarea name="requirements" rows={3} defaultValue={requirementsText} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /><p className="text-xs text-slate-400 mt-1">One requirement per line.</p></div>
        </section>

        <div className="flex justify-end"><button type="submit" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save changes</button></div>
      </form>
    </div>
  );
}
