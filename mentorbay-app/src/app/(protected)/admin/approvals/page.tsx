export const dynamic = "force-dynamic";

import { getPendingApprovals, getPendingPrograms, getPendingSessions, getPendingEvents, getPendingArticles } from "@/lib/admin";
import { setApprovalAction, setProgramApprovalAction, setSessionApprovalAction, setEventApprovalAction, setArticleApprovalAction } from "@/app/actions";

function Badge({ n }: { n: number }) {
  if (n === 0) return null;
  return <span className="ml-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{n}</span>;
}

export default async function AdminApprovalsPage() {
  const [users, programs, sessions, events, articles] = await Promise.all([
    getPendingApprovals(), getPendingPrograms(), getPendingSessions(), getPendingEvents(), getPendingArticles(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Approvals</h1>
        <p className="text-slate-500 mt-1">Approve new mentors, programs, sessions, and events before they go live.</p>
      </div>

      <section>
        <h2 className="font-bold text-navy mb-3">Mentor sign-ups <Badge n={users.length} /></h2>
        {users.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No pending mentors.</p> : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <span className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name[0]}
                </span>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{u.name}</p><p className="text-sm text-slate-500 capitalize">{u.role}</p></div>
                <div className="flex gap-2 items-center">
                  <a href={`/mentors/${u.id}?preview=1`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Preview</a>
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy mb-3">Programs <Badge n={programs.length} /></h2>
        {programs.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No programs awaiting review.</p> : (
          <div className="space-y-3">
            {programs.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy truncate">{p.title}</p><p className="text-sm text-slate-500">{p.category} · {p.level}</p></div>
                <div className="flex gap-2 items-center">
                  <a href={`/programs/${p.slug}?preview=1`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Preview</a>
                  <form action={setProgramApprovalAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setProgramApprovalAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy mb-3">Events <Badge n={events.length} /></h2>
        {events.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No events awaiting review.</p> : (
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy truncate">{e.title}</p><p className="text-sm text-slate-500">{e.category} · {e.format} · {e.date}</p></div>
                <div className="flex gap-2 items-center">
                  <a href={`/events/${e.slug}?preview=1`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Preview</a>
                  <form action={setEventApprovalAction}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setEventApprovalAction}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy mb-3">Sessions <Badge n={sessions.length} /></h2>
        {sessions.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No sessions awaiting review.</p> : (
          <div className="space-y-3">
            {sessions.map((sn) => (
              <div key={sn.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy truncate">{sn.topic}</p><p className="text-sm text-slate-500">{sn.mode} · {sn.when}</p></div>
                <div className="flex gap-2">
                  <form action={setSessionApprovalAction}><input type="hidden" name="id" value={sn.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setSessionApprovalAction}><input type="hidden" name="id" value={sn.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy mb-3">Articles <Badge n={articles.length} /></h2>
        {articles.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No articles awaiting review.</p> : (
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy truncate">{a.title}</p><p className="text-sm text-slate-500">by {a.author} · {a.date}</p></div>
                <div className="flex gap-2 items-center">
                  <a href={`/articles/${a.slug}?preview=1`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Preview</a>
                  <form action={setArticleApprovalAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setArticleApprovalAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
