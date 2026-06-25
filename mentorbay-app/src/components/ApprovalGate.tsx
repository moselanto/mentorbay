import { Logo } from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";

type Props = {
  approvalStatus: "pending" | "approved" | "rejected";
  suspended: boolean;
  roleLabel: string;
  children: React.ReactNode;
};

// Gates the dashboard: a new mentee/mentor must be approved by an admin before
// they can use the app. Suspended accounts are also blocked. Approved + not
// suspended -> render the dashboard normally.
export default function ApprovalGate({ approvalStatus, suspended, roleLabel, children }: Props) {
  const blocked = suspended || approvalStatus !== "approved";
  if (!blocked) return <>{children}</>;

  const isSuspended = suspended;
  const isRejected = !suspended && approvalStatus === "rejected";

  const title = isSuspended
    ? "Your account is suspended"
    : isRejected
    ? "Your account was not approved"
    : "Your account is awaiting approval";

  const body = isSuspended
    ? "Your MentorBay account has been suspended and access is temporarily restricted. If you believe this is a mistake, please contact our support team."
    : isRejected
    ? `Thank you for signing up as a ${roleLabel.toLowerCase()}. After review, your account was not approved at this time. If you believe this is a mistake, please contact our support team.`
    : `Thanks for signing up as a ${roleLabel.toLowerCase()}! Your account is pending review by an admin. You'll receive an email as soon as it is approved, and then you can start using MentorBay.`;

  const tone = isSuspended || isRejected
    ? "bg-rose-50 border-rose-200 text-rose-800"
    : "bg-amber-50 border-amber-200 text-amber-800";

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="flex justify-center mb-4"><Logo className="h-12 w-12" /></div>
        <h1 className="text-xl font-extrabold text-navy">{title}</h1>
        <div className={`mt-4 rounded-xl border p-4 text-sm text-left ${tone}`}>{body}</div>
        <div className="mt-6"><SignOutButton /></div>
      </div>
    </div>
  );
}
