-- MentorBay - sample data. Idempotent. Run in Supabase SQL Editor after 06.
-- Guarantees at least 5 mentors, 5 programs, 5 upcoming events, and 5 reviews.

insert into mentors (slug, name, role, industry, country, city, available, languages, experience, rating, reviews, mentees, skills, avatar_url) values
('jane-wanjiku','Jane Wanjiku','Career & Leadership Coach','Business','Kenya','Nairobi',true,'{English,Swahili}',12,4.9,120,124,'{Leadership,"Career Growth","Personal Branding"}','/images/sd7erhqwt022qcj3zh7r9nt7a188tncb.jpg'),
('john-kamau','John Kamau','Tech Entrepreneur','Technology','Kenya','Nairobi',true,'{English,Swahili}',10,4.8,98,98,'{Startups,"Product Strategy",Fundraising}','/images/sd7fd2ygetvv1t14epgbhnf31s88vgsk.jpg'),
('sarah-mwangi','Sarah Mwangi','Business Strategist','Business','Nigeria','Lagos',false,'{English}',15,4.9,150,150,'{"Business Strategy",Marketing,Sales}','/images/sd79aj8r0vdw5tawj8zpnn76dn88tdme.jpg'),
('david-ochieng','David Ochieng','Digital Marketing Expert','Marketing','Kenya','Nairobi',true,'{English,Swahili}',8,4.7,86,86,'{"Digital Marketing",SEO,"Growth Hacking"}','/images/sd75vfdt7nphcmkepenfdabf9188vzec.jpg'),
('lillian-anyango','Lillian Anyango','Data Scientist','Data','Kenya','Kisumu',true,'{English,Swahili}',7,4.9,130,130,'{"Data Science","AI/ML",Analytics}','/images/sd728rcfrx0j7wrnhaa2zh0ya188vf7q.jpg')
on conflict (slug) do nothing;

insert into programs (slug, title, category, level, weeks, lessons, mentor_slug, rating, enrolled, badge, cover_url, description) values
('leadership-mastery','Leadership Mastery Program','Leadership','Beginner',8,24,'jane-wanjiku',4.9,1240,'Bestseller','/images/sd7cxyvmncgt75zcbvkjs66p7s88tgjf.jpg','Build the confidence, clarity, and skills to lead teams and projects with impact.'),
('career-accelerator','Career Accelerator Bootcamp','Business','Intermediate',6,18,'jane-wanjiku',4.8,980,'Popular','/images/sd7fbrdmwf1ba8zryhj7mxhy6188vaw2.jpg','Fast-track your career in 6 weeks with a structured, mentor-led plan.'),
('startup-founder','Startup Founder Bootcamp','Business','Intermediate',10,30,'john-kamau',4.8,760,null,'/images/sd7cw7fxc5jdak3bhrek7g334188tm52.jpg','From idea to launch: validation, fundraising, and growth for African founders.'),
('fullstack-web','Full-Stack Web Development','Technology','Beginner',12,48,'john-kamau',4.9,1530,'New','/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg','Become a job-ready developer building real projects with modern tools.'),
('digital-marketing','Digital Marketing Mastery','Marketing','Beginner',6,20,'david-ochieng',4.7,1100,null,'/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg','SEO, social, and growth tactics that win customers across Africa.')
on conflict (slug) do nothing;

insert into events (slug, title, when_status, category, format, mon, day, date_label, time_label, location, speaker, face, img, going, featured) values
('future-of-work','Future of Work Conference 2026','upcoming','Business','In-person','JUN','25','Jun 25, 2026','9:00 AM','Sarit Centre, Nairobi','Sarah Mwangi','/images/sd79aj8r0vdw5tawj8zpnn76dn88tdme.jpg','/images/sd7fbrdmwf1ba8zryhj7mxhy6188vaw2.jpg',120,true),
('women-in-tech','Women in Tech Summit','upcoming','Technology','Online','JUL','10','Jul 10, 2026','9:00 AM','Online (Zoom)','Lillian Anyango','/images/sd728rcfrx0j7wrnhaa2zh0ya188vf7q.jpg','/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg',80,false),
('startup-growth','Startup Growth Masterclass','upcoming','Business','In-person','JUL','30','Jul 30, 2026','2:00 PM','iHub, Mombasa','John Kamau','/images/sd7fd2ygetvv1t14epgbhnf31s88vgsk.jpg','/images/sd7cw7fxc5jdak3bhrek7g334188tm52.jpg',60,false),
('digital-marketing-live','Digital Marketing Bootcamp Live','upcoming','Marketing','Online','AUG','08','Aug 8, 2026','10:00 AM','Online (Google Meet)','David Ochieng','/images/sd75vfdt7nphcmkepenfdabf9188vzec.jpg','/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg',95,false),
('personal-finance-clinic','Personal Finance Clinic','upcoming','Finance','Online','AUG','15','Aug 15, 2026','11:00 AM','Online (Zoom)','Grace Wairimu','/images/sd73mtg2fv8ezekjw91j55w0xs88tmdj.jpg','/images/sd7etkz00sjcxwh28x3znyxh6s88vj12.jpg',70,false)
on conflict (slug) do nothing;

-- Reviews: only seed if the table is empty (keeps re-runs from duplicating).
insert into reviews (mentor_slug, author_name, rating, body, status)
select v.mentor_slug, v.author_name, v.rating, v.body, v.status
from (values
  ('jane-wanjiku','James Otieno',5,'Jane helped me gain clarity and confidence. I landed a leadership role within three months.','visible'),
  ('john-kamau','Aisha Hassan',5,'Practical, sharp advice on building my startup. Worth every session.','visible'),
  ('sarah-mwangi','Brian Kiprop',4,'Strong strategic guidance. Helped me reposition my business for growth.','visible'),
  ('david-ochieng','Mercy Njoki',5,'My digital marketing finally works. Clear, actionable, and patient.','visible'),
  ('lillian-anyango','Kevin Omondi',5,'Brilliant data mentor. Broke complex topics into simple steps.','visible')
) as v(mentor_slug, author_name, rating, body, status)
where not exists (select 1 from reviews);
