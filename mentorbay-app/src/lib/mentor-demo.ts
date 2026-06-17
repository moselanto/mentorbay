// Shared demo data for the Mentor dashboard pages (until live tables are wired).
export const MENTEES = [
  { name: "James Otieno", goal: "Land a backend role", program: "Leadership Foundations", pct: 72, status: "Active" },
  { name: "Aisha Hassan", goal: "Switch into product", program: "Career Strategy", pct: 40, status: "Active" },
  { name: "Brian Kiprop", goal: "Grow as a team lead", program: "Leadership Foundations", pct: 90, status: "Active" },
  { name: "Faith Wambui", goal: "Build a portfolio", program: "Design Basics", pct: 25, status: "New" },
];

export const APPLICATIONS = [
  { name: "Daniel Mutua", note: "Looking for guidance moving from support into engineering.", when: "2 days ago" },
  { name: "Mercy Njoki", note: "Want to sharpen my leadership skills for a new manager role.", when: "4 days ago" },
  { name: "Kevin Omondi", note: "Building a startup, need help with go-to-market.", when: "1 week ago" },
];

export const MENTOR_SESSIONS = [
  { mentee: "James Otieno", topic: "Portfolio review", when: "Today · 4:00 PM", mode: "Google Meet" },
  { mentee: "Aisha Hassan", topic: "Career strategy", when: "Tomorrow · 10:00 AM", mode: "Zoom" },
  { mentee: "Brian Kiprop", topic: "1:1 check-in", when: "Fri, Jun 19 · 2:00 PM", mode: "Google Meet" },
];

export const REVIEWS = [
  { name: "James Otieno", rating: 5, text: "Incredibly insightful sessions. I landed my dream role thanks to the guidance." },
  { name: "Aisha Hassan", rating: 5, text: "Patient, practical, and always prepared. Highly recommend." },
  { name: "Brian Kiprop", rating: 4, text: "Great mentor - actionable feedback every single time." },
];

export const ARTICLES = [
  { title: "5 habits of effective tech leaders", status: "Published", views: 1240, date: "Jun 8, 2026" },
  { title: "How to ace your first 90 days", status: "Published", views: 860, date: "May 30, 2026" },
  { title: "Negotiating your offer (draft)", status: "Draft", views: 0, date: "—" },
];
