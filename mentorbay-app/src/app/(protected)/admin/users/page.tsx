import { MENTORS } from "@/lib/data";

const EXTRA = [
  { name: "James Otieno", role: "mentee", status: "Active" },
  { name: "Aisha Hassan", role: "mentee", status: "Active" },
  { name: "Daniel Mutua", role: "mentee", status: "Suspended" },
];

export default function AdminUsersPage() {
  const users = [
    ...MENTORS.slice(0, 4).map((m) => ({ name: m.name, role: "mentor", status: "Active" })),
    ...EXTRA,
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Users</h1>
        <input className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" placeholder="Search users..." />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr><th className="px-5 py-3 font-semibold">User</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u, i) => (
              <tr key={i}>
                <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold text-xs">{u.name[0]}</span><span className="font-medium text-navy">{u.name}</span></div></td>
                <td className="px-5 py-3 capitalize text-slate-600">{u.role}</td>
                <td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === "Suspended" ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-700"}`}>{u.status}</span></td>
                <td className="px-5 py-3 text-right"><button className="text-xs font-semibold text-slate-500 hover:text-navy">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
