import { createProgramAction } from "@/app/actions";

export default function CreateProgramPage({ searchParams }: { searchParams: { error?: string } }) {
  const pending = searchParams.error === "pending";
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Create a Program</h1>
      <p className="text-slate-500 -mt-3">Design a structured program for your mentees.</p>

      {pending && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Your mentor account is still pending approval, so you can&apos;t create programs yet. An admin will review you shortly.</p>}
      {searchParams.error === "title" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please enter a program title.</p>}
      {searchParams.error === "save" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Something went wrong saving the program. Please try again.</p>}

      <form action={createProgramAction} className="space-y-6">
        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">Program title</label><input name="title" required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Leadership Foundations" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Category</label><select name="category" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Leadership</option><option>Technology</option><option>Business</option><option>Marketing</option><option>Finance</option><option>Design</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Level</label><select name="level" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Duration (weeks)</label><input name="weeks" type="number" min={1} defaultValue={6} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Lessons</label><input name="lessons" type="number" min={1} defaultValue={12} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Description</label><textarea name="description" rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="What will mentees learn?" /></div>
        </section>
        <div className="flex justify-end gap-3">
          <button type="submit" name="intent" value="draft" className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:border-teal transition">Save draft</button>
          <button type="submit" name="intent" value="publish" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Publish program</button>
        </div>
      </form>
    </div>
  );
}
