"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [done, setDone] = useState(false);
  return (
    <div className="cta-gradient rounded-2xl p-8 md:p-10 text-center text-white">
      <h3 className="text-2xl font-extrabold">Get growth tips in your inbox</h3>
      <p className="text-teal-50/90 mt-2">Join 12,000+ learners getting weekly mentor insights, new resources, and event invites.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
          (e.target as HTMLFormElement).reset();
        }}
        className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input type="email" required placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-slate-700 outline-none" />
        <button className="px-6 py-3 bg-white text-navy font-semibold rounded-lg hover:bg-slate-100 transition">Subscribe</button>
      </form>
      {done && <p className="text-sm text-teal-50 mt-3">✓ Thanks for subscribing! Check your inbox to confirm.</p>}
    </div>
  );
}
