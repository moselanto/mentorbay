import { getSettings } from "@/lib/settings";
import { saveSettingsAction } from "@/app/actions";

export default async function AdminSettingsPage({ searchParams }: { searchParams: { saved?: string } }) {
  const { platformName, supportEmail } = await getSettings();
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Platform Settings</h1>

      {searchParams.saved && (
        <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Settings saved.</p>
      )}

      <form action={saveSettingsAction} className="space-y-6">
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Platform name</label>
              <input
                name="platform_name"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
                defaultValue={platformName}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Support email</label>
              <input
                name="support_email"
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
                placeholder="support@mentorbay.app"
                defaultValue={supportEmail ?? ""}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Used as the sender and reply-to address on notification emails to users (approvals, account
                changes). The sending domain must be verified in Resend for delivery from this exact address.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">
            Save settings
          </button>
        </div>
      </form>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Controls</h3>
        <div className="space-y-3">
          {[["Free launch mode (all programs free)", true], ["Require mentor approval", true], ["Allow new sign-ups", true], ["Maintenance mode", false]].map(([l, on]) => (
            <label key={l as string} className="flex items-center justify-between text-sm"><span className="text-slate-600">{l as string}</span><input type="checkbox" defaultChecked={on as boolean} className="w-5 h-5 accent-teal" /></label>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">Note: these toggles are presentational for now.</p>
      </section>
    </div>
  );
}
