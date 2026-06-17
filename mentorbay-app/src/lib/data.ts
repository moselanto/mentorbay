// Temporary demo data for Phase 1. Each export maps to a Supabase query later
// (see ../../MIGRATION.md, section 6). Images live in /public/images.

export type Mentor = {
  id: string;
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
