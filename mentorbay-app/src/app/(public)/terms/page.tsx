export const metadata = { title: "Terms of Service - MentorBay" };

const UPDATED = "June 20, 2026";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <p className="text-sm font-semibold text-teal-600">Legal</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mt-1">Terms of Service</h1>
      <p className="text-slate-500 mt-2 text-sm">Last updated: {UPDATED}</p>

      <div className="prose-mentorbay mt-8 space-y-8 text-slate-600 leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg font-bold text-navy">1. Agreement to terms</h2>
          <p className="mt-2">By accessing or using MentorBay (the &quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all visitors, mentees, mentors and administrators.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">2. Who we are</h2>
          <p className="mt-2">MentorBay is a mentorship platform that connects learners (&quot;mentees&quot;) with experienced professionals (&quot;mentors&quot;) through profiles, programs, events and sessions. MentorBay facilitates these connections but is not a party to the mentoring relationship itself.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">3. Accounts and eligibility</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You must provide accurate information when creating an account and keep it up to date.</li>
            <li>You are responsible for safeguarding your login credentials and for all activity under your account.</li>
            <li>Mentor accounts are subject to review and approval before publishing content; approval is at our discretion.</li>
            <li>You must be at least 18 years old, or have the consent of a parent or guardian, to use the Platform.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">4. Mentor and mentee conduct</h2>
          <p className="mt-2">All users agree to interact respectfully and professionally. Mentors are responsible for the accuracy of the programs, events and guidance they offer. Mentees are responsible for their own decisions and outcomes. You agree not to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Post false, misleading, unlawful, harassing or infringing content.</li>
            <li>Impersonate any person or misrepresent your qualifications or affiliation.</li>
            <li>Solicit users for purposes unrelated to mentorship, or circumvent the Platform&apos;s features.</li>
            <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Platform.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">5. Content and moderation</h2>
          <p className="mt-2">You retain ownership of content you submit, but grant MentorBay a non-exclusive, worldwide licence to host and display it for the purpose of operating the Platform. We may review, approve, reject, remove or moderate content, and may suspend accounts that violate these terms.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">6. Fees</h2>
          <p className="mt-2">During our launch period, programs and sessions are offered free of charge. We will clearly communicate any future charges before they apply, and you will have the choice to accept them.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">7. Disclaimers</h2>
          <p className="mt-2">The Platform is provided &quot;as is&quot; without warranties of any kind. MentorBay does not guarantee any particular result, employment, or outcome from using the Platform or from any mentoring relationship. Mentors are independent and not employees or agents of MentorBay.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">8. Limitation of liability</h2>
          <p className="mt-2">To the maximum extent permitted by law, MentorBay shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform or interactions with other users.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">9. Suspension and termination</h2>
          <p className="mt-2">We may suspend or terminate access to accounts that breach these terms or that we reasonably believe pose a risk to other users or the Platform. You may close your account at any time.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">10. Changes to these terms</h2>
          <p className="mt-2">We may update these terms from time to time. Material changes will be communicated through the Platform or by email. Continued use after changes take effect constitutes acceptance.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">11. Governing law</h2>
          <p className="mt-2">These terms are governed by the laws of the Republic of Kenya, without regard to conflict-of-law principles.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">12. Contact</h2>
          <p className="mt-2">Questions about these terms? Reach us through our <a href="/contact" className="text-teal-600 font-semibold hover:underline">Contact Us</a> page.</p>
        </section>
      </div>
    </div>
  );
}
