-- MentorBay - events table (additive migration). Run in Supabase SQL Editor.
-- This does NOT touch your existing mentors/programs data.

drop table if exists events cascade;

create table events (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  when_status  text not null default 'upcoming', -- 'upcoming' | 'past'
  category     text,
  format       text,                              -- 'Online' | 'In-person'
  mon          text,
  day          text,
  date_label   text,
  time_label   text,
  location     text,
  speaker      text,
  face         text,
  img          text,
  going        int default 0,
  featured     boolean default false,
  status       text not null default 'published',
  created_at   timestamptz default now()
);

alter table events enable row level security;
create policy "Public can read published events"
  on events for select using (status = 'published');

insert into events (slug, title, when_status, category, format, mon, day, date_label, time_label, location, speaker, face, img, going, featured) values
('future-of-work','Future of Work Conference 2026','upcoming','Business','In-person','JUN','25','Jun 25, 2026','9:00 AM','Sarit Centre, Nairobi','Sarah Mwangi','/images/sd79aj8r0vdw5tawj8zpnn76dn88tdme.jpg','/images/sd7fbrdmwf1ba8zryhj7mxhy6188vaw2.jpg',120,true),
('women-in-tech','Women in Tech Summit','upcoming','Technology','Online','JUL','10','Jul 10, 2026','9:00 AM','Online (Zoom)','Lillian Anyango','/images/sd728rcfrx0j7wrnhaa2zh0ya188vf7q.jpg','/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg',80,false),
('startup-growth','Startup Growth Masterclass','upcoming','Business','In-person','JUL','30','Jul 30, 2026','2:00 PM','iHub, Mombasa','John Kamau','/images/sd7fd2ygetvv1t14epgbhnf31s88vgsk.jpg','/images/sd7cw7fxc5jdak3bhrek7g334188tm52.jpg',60,false),
('digital-marketing-live','Digital Marketing Bootcamp Live','upcoming','Marketing','Online','AUG','08','Aug 8, 2026','10:00 AM','Online (Google Meet)','David Ochieng','/images/sd75vfdt7nphcmkepenfdabf9188vzec.jpg','/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg',95,false),
('personal-finance-clinic','Personal Finance Clinic','upcoming','Finance','Online','AUG','15','Aug 15, 2026','11:00 AM','Online (Zoom)','Grace Wairimu','/images/sd73mtg2fv8ezekjw91j55w0xs88tmdj.jpg','/images/sd7etkz00sjcxwh28x3znyxh6s88vj12.jpg',70,false),
('leadership-forum','Leadership Forum Nairobi','upcoming','Leadership','In-person','AUG','22','Aug 22, 2026','9:30 AM','KICC, Nairobi','Jane Wanjiku','/images/sd7erhqwt022qcj3zh7r9nt7a188tncb.jpg','/images/sd7cxyvmncgt75zcbvkjs66p7s88tgjf.jpg',110,false),
('tech-careers-fair','Tech Careers Fair 2026','past','Technology','In-person','MAY','20','May 20, 2026','9:00 AM','USIU, Nairobi','John Kamau','/images/sd7fd2ygetvv1t14epgbhnf31s88vgsk.jpg','/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg',340,false),
('design-thinking','Design Thinking Workshop','past','Business','Online','APR','18','Apr 18, 2026','2:00 PM','Online','Kevin Mwangi','/images/sd75by8ns0j4qabn92ryzmvjp988v394.jpg','/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg',150,false);
