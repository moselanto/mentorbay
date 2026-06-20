export const metadata = { title: "Privacy Policy - MentorBay" };

const UPDATED = "June 20, 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <p className="text-sm font-semibold text-teal-600">Legal</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mt-1">Privacy Policy</h1>
      <p className="text-slate-500 mt-2 text-sm">Last updated: {UPDATED}</p>

      <div className="mt-8 space-y-8 text-slate-600 leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg font-bold text-navy">1. Introduction</h2>
          <p className="mt-2">This Privacy Policy explains how MentorBay (&quot;we&quot;, &quot;us&quot;) collects, uses and protects your personal information when you use our platform. We are committed to handling your data responsibly and transparently.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">2. Information we collect</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> your name, email address, role (mentee, mentor or admin), and password (stored securely and never in plain text).</li>
            <li><strong>Profile information:</strong> headline, bio, location, languages, skills, avatar and other details you choose to add.</li>
            <li><strong>Content you create:</strong> programs, events, sessions, reviews, applications and messages.</li>
            <li><strong>Usage data:</strong> basic technical information such as pages visited and actions taken, used to operate and improve the Platform.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">3. How we use your information</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>To create and manage your account and profile.</li>
            <li>To connect mentees with mentors and enable programs, events and sessions.</li>
            <li>To send you service notifications - for example, account approval, content approval decisions, and important account changes.</li>
            <li>To review and moderate content for safety and quality.</li>
            <li>To improve, secure and maintain the Platform.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">4. Email notifications</h2>
          <p className="mt-2">We send transactional emails related to your account (such as approvals and account updates). These are sent from our support address and are part of operating the service. We do not sell your email address.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">5. How we share information</h2>
          <p className="mt-2">We do not sell your personal data. Limited information is shared in these cases:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li><strong>Publicly:</strong> mentor profiles and approved content (programs, events, reviews) are visible to other users by design.</li>
            <li><strong>Service providers:</strong> trusted infrastructure partners that host our database, authentication and email delivery, acting on our instructions.</li>
            <li><strong>Legal:</strong> where required by law or to protect the rights and safety of our users.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">6. Data security</h2>
          <p className="mt-2">We use industry-standard measures including encrypted connections, secure authentication and access controls. While no system is perfectly secure, we work to protect your information and limit access to it.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">7. Your rights and choices</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Access and update your profile information from your dashboard settings.</li>
            <li>Request deletion of your account and associated personal data.</li>
            <li>Contact us with any questions about how your data is handled.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">8. Data retention</h2>
          <p className="mt-2">We retain your information for as long as your account is active or as needed to provide the service. When you delete your account, we remove or anonymize your personal data, except where retention is required by law.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">9. Children&apos;s privacy</h2>
          <p className="mt-2">MentorBay is intended for users aged 18 and over, or younger users with the consent of a parent or guardian. We do not knowingly collect data from children without such consent.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">10. Changes to this policy</h2>
          <p className="mt-2">We may update this policy from time to time. We will post the updated version here and revise the &quot;Last updated&quot; date above. Material changes may also be communicated by email.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">11. Contact us</h2>
          <p className="mt-2">For privacy questions or requests, please use our <a href="/contact" className="text-teal-600 font-semibold hover:underline">Contact Us</a> page.</p>
        </section>
      </div>
    </div>
  );
}
