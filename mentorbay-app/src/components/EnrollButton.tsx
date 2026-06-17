"use client";

import { useState } from "react";

// Demo enroll toggle. In Phase 5 this calls supabase.from('enrollments').insert(...).
export default function EnrollButton() {
  const [enrolled, setEnrolled] = useState(false);
  return (
    <button
      onClick={() => setEnrolled((v) => !v)}
      className={`w-full mt-4 py-3 text-white font-semibold rounded-lg transition ${
        enrolled ? "bg-teal hover:bg-teal-600" : "bg-navy hover:bg-navy-700"
      }`}
    >
      {enrolled ? "Enrolled ✓" : "Enroll Now"}
    </button>
  );
}
