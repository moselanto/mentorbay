import { enrollProgramAction } from "@/app/actions";
import ProgramEnrollForm from "@/components/ProgramEnrollForm";

// Server-action enroll/unenroll. `enrolled` reflects persisted APPROVED state.
// `pending` means the mentee requested enrollment but the mentor hasn't approved yet.
export default function EnrollButton({ slug, enrolled, pending = false }: { slug: string; enrolled: boolean; pending?: boolean }) {
  if (pending) {
    return (
      <div className="mt-4 space-y-2">
        <div className="w-full py-3 text-center text-amber-700 font-semibold rounded-lg bg-amber-50 border border-amber-200">
          Requested - awaiting mentor approval
        </div>
        <form action={enrollProgramAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="action" value="unenroll" />
          <input type="hidden" name="redirect" value={`/programs/${slug}`} />
          <button className="w-full py-2 text-sm text-slate-500 font-semibold rounded-lg border border-slate-200 hover:border-rose-300 hover:text-rose-500 transition">
            Cancel request
          </button>
        </form>
      </div>
    );
  }
  // Enrolled (approved): allow leaving. Not enrolled: open the contact form to request enrollment.
  if (enrolled) {
    return (
      <form action={enrollProgramAction} className="mt-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="action" value="unenroll" />
        <input type="hidden" name="redirect" value={`/programs/${slug}`} />
        <button className="w-full py-3 text-white font-semibold rounded-lg transition bg-teal hover:bg-teal-600">Enrolled \u2713 - Leave program</button>
      </form>
    );
  }
  return <ProgramEnrollForm slug={slug} />;
}
