import { enrollProgramAction } from "@/app/actions";

// Server-action enroll/unenroll. `enrolled` reflects persisted state so the
// label is correct after reload.
export default function EnrollButton({ slug, enrolled }: { slug: string; enrolled: boolean }) {
  return (
    <form action={enrollProgramAction} className="mt-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="action" value={enrolled ? "unenroll" : "enroll"} />
      <input type="hidden" name="redirect" value={`/programs/${slug}`} />
      <button
        className={`w-full py-3 text-white font-semibold rounded-lg transition ${enrolled ? "bg-teal hover:bg-teal-600" : "bg-navy hover:bg-navy-700"}`}
      >
        {enrolled ? "Enrolled \u2713 - Leave program" : "Enroll Now"}
      </button>
    </form>
  );
}
