// Temporary demo data for Phase 1. Each export maps to a Supabase query later
// (see ../../MIGRATION.md, section 6). Images live in /public/images.

export type Mentor = {
  id: string;
  profileId?: string;
  name: string;
  role: string;
  industry: string;
  country: string;
  city: string;
  avail: "Available" | "Busy";
  langs: string[];
  exp: number;
  rating: number;
  reviews: number;
  mentees: number;
  skills: string[];
  img: string; // /images/<id>.jpg
};

const img = (id: string) => `/images/${id}.jpg`;

export const MENTORS: Mentor[] = [
  { id: "jane-wanjiku", name: "Jane Wanjiku", role: "Career & Leadership Coach", industry: "Business", country: "Kenya", city: "Nairobi", avail: "Available", langs: ["English", "Swahili"], exp: 12, rating: 4.9, reviews: 120, mentees: 124, skills: ["Leadership", "Career Growth", "Personal Branding"], img: img("sd7erhqwt022qcj3zh7r9nt7a188tncb") },
  { id: "john-kamau", name: "John Kamau", role: "Tech Entrepreneur", industry: "Technology", country: "Kenya", city: "Nairobi", avail: "Available", langs: ["English", "Swahili"], exp: 10, rating: 4.8, reviews: 98, mentees: 98, skills: ["Startups", "Product Strategy", "Fundraising"], img: img("sd7fd2ygetvv1t14epgbhnf31s88vgsk") },
  { id: "sarah-mwangi", name: "Sarah Mwangi", role: "Business Strategist", industry: "Business", country: "Nigeria", city: "Lagos", avail: "Busy", langs: ["English"], exp: 15, rating: 4.9, reviews: 150, mentees: 150, skills: ["Business Strategy", "Marketing", "Sales"], img: img("sd79aj8r0vdw5tawj8zpnn76dn88tdme") },
  { id: "david-ochieng", name: "David Ochieng", role: "Digital Marketing Expert", industry: "Marketing", country: "Kenya", city: "Nairobi", avail: "Available", langs: ["English", "Swahili"], exp: 8, rating: 4.7, reviews: 86, mentees: 86, skills: ["Digital Marketing", "SEO", "Growth Hacking"], img: img("sd75vfdt7nphcmkepenfdabf9188vzec") },
  { id: "mary-achieng", name: "Mary Achieng", role: "HR & People Coach", industry: "Human Resources", country: "Kenya", city: "Nairobi", avail: "Busy", langs: ["English", "Swahili"], exp: 11, rating: 4.9, reviews: 110, mentees: 110, skills: ["HR Strategy", "Talent Management", "Coaching"], img: img("sd723egrf1asak9t0sd16pdyf188vn53") },
  { id: "samuel-njoroge", name: "Samuel Njoroge", role: "Product Manager", industry: "Technology", country: "Kenya", city: "Mombasa", avail: "Available", langs: ["English"], exp: 9, rating: 4.8, reviews: 74, mentees: 74, skills: ["Product Management", "Agile", "UX Strategy"], img: img("sd71p21y9dxds7tvxmv5hnq1g988v9nv") },
  { id: "lillian-anyango", name: "Lillian Anyango", role: "Data Scientist", industry: "Data", country: "Kenya", city: "Kisumu", avail: "Available", langs: ["English", "Swahili"], exp: 7, rating: 4.9, reviews: 130, mentees: 130, skills: ["Data Science", "AI/ML", "Analytics"], img: img("sd728rcfrx0j7wrnhaa2zh0ya188vf7q") },
  { id: "brian-otieno", name: "Brian Otieno", role: "Engineering Lead", industry: "Technology", country: "Kenya", city: "Nairobi", avail: "Available", langs: ["English"], exp: 10, rating: 4.8, reviews: 95, mentees: 95, skills: ["Software Engineering", "Cloud", "System Design"], img: img("sd79gt2ajkr4serddsw8cebepn88v870") },
  { id: "grace-wairimu", name: "Grace Wairimu", role: "Finance & Investment Advisor", industry: "Finance", country: "Kenya", city: "Nakuru", avail: "Available", langs: ["English", "Swahili"], exp: 9, rating: 4.7, reviews: 68, mentees: 68, skills: ["Finance", "Investing", "Wealth Management"], img: img("sd73mtg2fv8ezekjw91j55w0xs88tmdj") },
  { id: "kevin-mwangi", name: "Kevin Mwangi", role: "UX & Design Lead", industry: "Design", country: "Kenya", city: "Nairobi", avail: "Busy", langs: ["English"], exp: 6, rating: 4.9, reviews: 88, mentees: 88, skills: ["UX Design", "Product Design", "Branding"], img: img("sd75by8ns0j4qabn92ryzmvjp988v394") },
  { id: "aisha-hassan", name: "Aisha Hassan", role: "Software Engineer", industry: "Technology", country: "Kenya", city: "Mombasa", avail: "Available", langs: ["English", "Swahili"], exp: 5, rating: 4.8, reviews: 54, mentees: 54, skills: ["Web Development", "JavaScript", "React"], img: img("sd76649zdx97w9ve28wfndra6d88vdek") },
  { id: "daniel-kiprop", name: "Daniel Kiprop", role: "Financial Advisor", industry: "Finance", country: "Kenya", city: "Eldoret", avail: "Available", langs: ["English", "Swahili"], exp: 14, rating: 4.8, reviews: 95, mentees: 95, skills: ["Financial Planning", "Investing", "Budgeting"], img: img("sd7cb0223na4m9xntwvezwxyz588veqn") },
];

// Scene images reused for events/programs
export const SCENES = {
  workshop: img("sd7cw7fxc5jdak3bhrek7g334188tm52"),
  conference: img("sd7fbrdmwf1ba8zryhj7mxhy6188vaw2"),
  tech: img("sd79w96bc0dmwb9qd0rg1h4ek988tdaq"),
  leadership: img("sd7cxyvmncgt75zcbvkjs66p7s88tgjf"),
  marketing: img("sd7f8shp9xrg8xvwefbhc1peyx88tt44"),
  finance: img("sd7etkz00sjcxwh28x3znyxh6s88vj12"),
  hero: img("sd72apqakrkwgzn4m445fmh1g588v0mg"),
};

export const FEATURED_MENTORS = MENTORS.slice(0, 4);

export const UPCOMING_EVENTS = [
  { id: "future-of-work", title: "Future of Work Conference", date: "Jun 25, 2026", time: "9:00 AM", loc: "Nairobi, Kenya", going: "120+", img: SCENES.conference },
  { id: "women-in-tech", title: "Women in Tech Summit", date: "Jul 10, 2026", time: "9:00 AM", loc: "Online", going: "80+", img: SCENES.conference },
  { id: "startup-growth", title: "Startup Growth Masterclass", date: "Jul 30, 2026", time: "2:00 PM", loc: "Mombasa, Kenya", going: "60+", img: SCENES.workshop },
];

export const POPULAR_PROGRAMS = [
  { id: "leadership-mastery", title: "Leadership Mastery Program", weeks: "8 Weeks", level: "Beginner", badge: "Bestseller", img: SCENES.workshop },
  { id: "career-accelerator", title: "Career Accelerator Bootcamp", weeks: "6 Weeks", level: "Intermediate", badge: "Popular", img: SCENES.conference },
  { id: "entrepreneurship", title: "Entrepreneurship Blueprint", weeks: "10 Weeks", level: "All Levels", badge: "New", img: SCENES.workshop },
  { id: "data-science", title: "Data Science Mentorship", weeks: "8 Weeks", level: "Intermediate", badge: "", img: SCENES.conference },
];

export const SUCCESS_STORIES = [
  { name: "Esther W.", role: "Product Designer, Nairobi", quote: "My mentor helped me gain clarity and confidence. The guidance was exactly what I needed.", img: img("sd76649zdx97w9ve28wfndra6d88vdek") },
  { name: "Collins M.", role: "Software Engineer, Kisumu", quote: "Through the program I improved my CV, got multiple interviews, and landed my dream job!", img: img("sd7cb0223na4m9xntwvezwxyz588veqn") },
  { name: "Faith K.", role: "Team Lead, Mombasa", quote: "The leadership sessions were practical and life-changing. Highly recommend MentorBay.", img: img("sd79aj8r0vdw5tawj8zpnn76dn88tdme") },
];

// Portrait helpers (reused as mentor faces / authors / speakers)
const FACE = {
  jane: img("sd7erhqwt022qcj3zh7r9nt7a188tncb"),
  john: img("sd7fd2ygetvv1t14epgbhnf31s88vgsk"),
  sarah: img("sd79aj8r0vdw5tawj8zpnn76dn88tdme"),
  david: img("sd75vfdt7nphcmkepenfdabf9188vzec"),
  mary: img("sd723egrf1asak9t0sd16pdyf188vn53"),
  samuel: img("sd71p21y9dxds7tvxmv5hnq1g988v9nv"),
  lillian: img("sd728rcfrx0j7wrnhaa2zh0ya188vf7q"),
  brian: img("sd79gt2ajkr4serddsw8cebepn88v870"),
  grace: img("sd73mtg2fv8ezekjw91j55w0xs88tmdj"),
  kevin: img("sd75by8ns0j4qabn92ryzmvjp988v394"),
  aisha: img("sd76649zdx97w9ve28wfndra6d88vdek"),
  daniel: img("sd7cb0223na4m9xntwvezwxyz588veqn"),
};

// ---- Programs ----
export type Program = {
  id: string; title: string; category: string; level: string; weeks: number; lessons: number;
  mentor: string; mentorId: string; face: string; img: string; rating: number; enrolled: number;
  badge?: string; description: string;
  about?: string; learn?: string[]; curriculum?: { title: string; lessons: string[] }[];
  durationLabel?: string; status?: string; requirements?: string[];
  isPaid?: boolean; priceKes?: number; maxInstallments?: number;
  meetingType?: "online" | "physical"; meetingProvider?: string; meetingUrl?: string; programLocation?: string;
  cohortStart?: string; cohortStatus?: string;
};

export const PROGRAMS: Program[] = [
  { id: "leadership-mastery", title: "Leadership Mastery Program", category: "Leadership", level: "Beginner", weeks: 8, lessons: 24, mentor: "Jane Wanjiku", mentorId: "jane-wanjiku", face: FACE.jane, img: SCENES.leadership, rating: 4.9, enrolled: 1240, badge: "Bestseller", description: "Build the confidence, clarity, and skills to lead teams and projects with impact." },
  { id: "career-accelerator", title: "Career Accelerator Bootcamp", category: "Business", level: "Intermediate", weeks: 6, lessons: 18, mentor: "Jane Wanjiku", mentorId: "jane-wanjiku", face: FACE.jane, img: SCENES.conference, rating: 4.8, enrolled: 980, badge: "Popular", description: "Fast-track your career in 6 weeks with a structured, mentor-led plan." },
  { id: "startup-founder", title: "Startup Founder Bootcamp", category: "Business", level: "Intermediate", weeks: 10, lessons: 30, mentor: "John Kamau", mentorId: "john-kamau", face: FACE.john, img: SCENES.workshop, rating: 4.8, enrolled: 760, description: "From idea to launch: validation, fundraising, and growth for African founders." },
  { id: "fullstack-web", title: "Full-Stack Web Development", category: "Technology", level: "Beginner", weeks: 12, lessons: 48, mentor: "Brian Otieno", mentorId: "brian-otieno", face: FACE.brian, img: SCENES.tech, rating: 4.9, enrolled: 1530, badge: "New", description: "Become a job-ready developer building real projects with modern tools." },
  { id: "data-science", title: "Data Science Fundamentals", category: "Data", level: "Intermediate", weeks: 8, lessons: 32, mentor: "Lillian Anyango", mentorId: "lillian-anyango", face: FACE.lillian, img: SCENES.tech, rating: 4.9, enrolled: 870, description: "Learn analytics, machine learning, and how to break into data careers." },
  { id: "digital-marketing", title: "Digital Marketing Mastery", category: "Marketing", level: "Beginner", weeks: 6, lessons: 20, mentor: "David Ochieng", mentorId: "david-ochieng", face: FACE.david, img: SCENES.marketing, rating: 4.7, enrolled: 1100, description: "SEO, social, and growth tactics that win customers across Africa." },
  { id: "personal-finance", title: "Personal Finance & Investing", category: "Finance", level: "Beginner", weeks: 4, lessons: 12, mentor: "Grace Wairimu", mentorId: "grace-wairimu", face: FACE.grace, img: SCENES.finance, rating: 4.8, enrolled: 640, description: "Take control of your money, build savings, and start investing wisely." },
  { id: "ux-design", title: "UX Design Essentials", category: "Design", level: "Beginner", weeks: 8, lessons: 26, mentor: "Kevin Mwangi", mentorId: "kevin-mwangi", face: FACE.kevin, img: SCENES.marketing, rating: 4.9, enrolled: 720, description: "Design products people love, from research to polished interfaces." },
  { id: "product-management", title: "Product Management 101", category: "Technology", level: "Intermediate", weeks: 8, lessons: 24, mentor: "Samuel Njoroge", mentorId: "samuel-njoroge", face: FACE.samuel, img: SCENES.conference, rating: 4.8, enrolled: 590, description: "Learn to lead products and ship features that matter." },
];

// ---- Events ----
export type EventItem = {
  id: string; title: string; when: "upcoming" | "past"; category: string; type: "Online" | "In-person";
  mon: string; day: string; date: string; time: string; loc: string; speaker: string; speakers?: { name: string; role: string }[]; face: string;
  img: string; going: number; featured?: boolean;
};

export const EVENTS: EventItem[] = [
  { id: "future-of-work", title: "Future of Work Conference 2026", when: "upcoming", category: "Business", type: "In-person", mon: "JUN", day: "25", date: "Jun 25, 2026", time: "9:00 AM", loc: "Sarit Centre, Nairobi", speaker: "Sarah Mwangi", face: FACE.sarah, img: SCENES.conference, going: 120, featured: true },
  { id: "women-in-tech", title: "Women in Tech Summit", when: "upcoming", category: "Technology", type: "Online", mon: "JUL", day: "10", date: "Jul 10, 2026", time: "9:00 AM", loc: "Online (Zoom)", speaker: "Lillian Anyango", face: FACE.lillian, img: SCENES.tech, going: 80 },
  { id: "startup-growth", title: "Startup Growth Masterclass", when: "upcoming", category: "Business", type: "In-person", mon: "JUL", day: "30", date: "Jul 30, 2026", time: "2:00 PM", loc: "iHub, Mombasa", speaker: "John Kamau", face: FACE.john, img: SCENES.workshop, going: 60 },
  { id: "digital-marketing-live", title: "Digital Marketing Bootcamp Live", when: "upcoming", category: "Marketing", type: "Online", mon: "AUG", day: "08", date: "Aug 8, 2026", time: "10:00 AM", loc: "Online (Google Meet)", speaker: "David Ochieng", face: FACE.david, img: SCENES.marketing, going: 95 },
  { id: "personal-finance-clinic", title: "Personal Finance Clinic", when: "upcoming", category: "Finance", type: "Online", mon: "AUG", day: "15", date: "Aug 15, 2026", time: "11:00 AM", loc: "Online (Zoom)", speaker: "Grace Wairimu", face: FACE.grace, img: SCENES.finance, going: 70 },
  { id: "leadership-forum", title: "Leadership Forum Nairobi", when: "upcoming", category: "Leadership", type: "In-person", mon: "AUG", day: "22", date: "Aug 22, 2026", time: "9:30 AM", loc: "KICC, Nairobi", speaker: "Jane Wanjiku", face: FACE.jane, img: SCENES.leadership, going: 110 },
  { id: "tech-careers-fair", title: "Tech Careers Fair 2026", when: "past", category: "Technology", type: "In-person", mon: "MAY", day: "20", date: "May 20, 2026", time: "9:00 AM", loc: "USIU, Nairobi", speaker: "John Kamau", face: FACE.john, img: SCENES.tech, going: 340 },
  { id: "design-thinking", title: "Design Thinking Workshop", when: "past", category: "Business", type: "Online", mon: "APR", day: "18", date: "Apr 18, 2026", time: "2:00 PM", loc: "Online", speaker: "Kevin Mwangi", face: FACE.kevin, img: SCENES.marketing, going: 150 },
];

// ---- Resources ----
export type Resource = {
  type: "Article" | "Video" | "Course" | "Guide";
  title: string; author: string; face: string; img: string; meta: string;
};

export const RESOURCES: Resource[] = [
  { type: "Article", title: "5 Strategies to Accelerate Your Career Growth", author: "Jane Wanjiku", face: FACE.jane, img: SCENES.leadership, meta: "8 min read" },
  { type: "Video", title: "Personal Branding on LinkedIn", author: "David Ochieng", face: FACE.david, img: SCENES.marketing, meta: "15 min watch" },
  { type: "Course", title: "Time Management Fundamentals", author: "Mary Achieng", face: FACE.mary, img: SCENES.workshop, meta: "12 lessons" },
  { type: "Guide", title: "The Complete Job Interview Playbook", author: "Jane Wanjiku", face: FACE.jane, img: SCENES.conference, meta: "PDF · 24 pages" },
  { type: "Article", title: "How to Build a Powerful Personal Brand", author: "David Ochieng", face: FACE.david, img: SCENES.marketing, meta: "6 min read" },
  { type: "Video", title: "Breaking Into Data Science", author: "Lillian Anyango", face: FACE.lillian, img: SCENES.tech, meta: "20 min watch" },
  { type: "Course", title: "Financial Literacy for Beginners", author: "Grace Wairimu", face: FACE.grace, img: SCENES.finance, meta: "10 lessons" },
  { type: "Article", title: "Negotiating Your First Salary", author: "Sarah Mwangi", face: FACE.sarah, img: SCENES.conference, meta: "7 min read" },
  { type: "Guide", title: "Startup Fundraising Checklist", author: "John Kamau", face: FACE.john, img: SCENES.workshop, meta: "PDF · 12 pages" },
];

// ---- Success stories (full) ----
export type Story = {
  name: string; cat: string; img: string; from: string; to: string; mentor: string; quote: string;
};

export const STORIES: Story[] = [
  { name: "Collins Mutua", cat: "Design", img: FACE.kevin, from: "Support Agent", to: "UX Designer at Twiga", mentor: "Kevin Mwangi", quote: "My mentor helped me build a portfolio that got me hired. The feedback was honest and practical." },
  { name: "Faith Kemunto", cat: "Data", img: FACE.lillian, from: "Secondary Teacher", to: "Data Analyst at Safaricom", mentor: "Lillian Anyango", quote: "I switched careers at 31. The Data Science program and my mentor made it possible." },
  { name: "Daniel Kibet", cat: "Business", img: FACE.samuel, from: "Sales Rep", to: "Product Manager", mentor: "Samuel Njoroge", quote: "I learned to think like a PM and lead without authority. Promoted within six months." },
  { name: "Aisha Hassan", cat: "Finance", img: FACE.grace, from: "Intern", to: "Finance Associate at KCB", mentor: "Grace Wairimu", quote: "From confused intern to confident associate. The clarity my mentor gave me was priceless." },
  { name: "Brian Otieno", cat: "Tech", img: FACE.brian, from: "Freelance Developer", to: "Engineering Lead", mentor: "John Kamau", quote: "I went from solo freelancer to leading a team of eight. Mentorship made the difference." },
  { name: "Mary Achieng", cat: "Business", img: FACE.mary, from: "HR Assistant", to: "People Operations Manager", mentor: "Jane Wanjiku", quote: "The leadership program gave me the confidence to step up and own my career." },
];

// ---- Lookups (become Supabase .eq('id', id).single() queries later) ----
export const getMentor = (id: string) => MENTORS.find((m) => m.id === id);
export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);
export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);
