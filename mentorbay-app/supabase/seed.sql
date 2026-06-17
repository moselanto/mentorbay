-- MentorBay - seed data (run AFTER schema.sql, in the Supabase SQL Editor).
-- Image paths point at /public/images, which already ships with the app.

insert into mentors (slug, name, role, industry, country, city, available, languages, experience, rating, reviews, mentees, skills, avatar_url) values
('jane-wanjiku','Jane Wanjiku','Career & Leadership Coach','Business','Kenya','Nairobi',true,'{English,Swahili}',12,4.9,120,124,'{Leadership,"Career Growth","Personal Branding"}','/images/sd7erhqwt022qcj3zh7r9nt7a188tncb.jpg'),
('john-kamau','John Kamau','Tech Entrepreneur','Technology','Kenya','Nairobi',true,'{English,Swahili}',10,4.8,98,98,'{Startups,"Product Strategy",Fundraising}','/images/sd7fd2ygetvv1t14epgbhnf31s88vgsk.jpg'),
('sarah-mwangi','Sarah Mwangi','Business Strategist','Business','Nigeria','Lagos',false,'{English}',15,4.9,150,150,'{"Business Strategy",Marketing,Sales}','/images/sd79aj8r0vdw5tawj8zpnn76dn88tdme.jpg'),
('david-ochieng','David Ochieng','Digital Marketing Expert','Marketing','Kenya','Nairobi',true,'{English,Swahili}',8,4.7,86,86,'{"Digital Marketing",SEO,"Growth Hacking"}','/images/sd75vfdt7nphcmkepenfdabf9188vzec.jpg'),
('mary-achieng','Mary Achieng','HR & People Coach','Human Resources','Kenya','Nairobi',false,'{English,Swahili}',11,4.9,110,110,'{"HR Strategy","Talent Management",Coaching}','/images/sd723egrf1asak9t0sd16pdyf188vn53.jpg'),
('samuel-njoroge','Samuel Njoroge','Product Manager','Technology','Kenya','Mombasa',true,'{English}',9,4.8,74,74,'{"Product Management",Agile,"UX Strategy"}','/images/sd71p21y9dxds7tvxmv5hnq1g988v9nv.jpg'),
('lillian-anyango','Lillian Anyango','Data Scientist','Data','Kenya','Kisumu',true,'{English,Swahili}',7,4.9,130,130,'{"Data Science","AI/ML",Analytics}','/images/sd728rcfrx0j7wrnhaa2zh0ya188vf7q.jpg'),
('brian-otieno','Brian Otieno','Engineering Lead','Technology','Kenya','Nairobi',true,'{English}',10,4.8,95,95,'{"Software Engineering",Cloud,"System Design"}','/images/sd79gt2ajkr4serddsw8cebepn88v870.jpg'),
('grace-wairimu','Grace Wairimu','Finance & Investment Advisor','Finance','Kenya','Nakuru',true,'{English,Swahili}',9,4.7,68,68,'{Finance,Investing,"Wealth Management"}','/images/sd73mtg2fv8ezekjw91j55w0xs88tmdj.jpg'),
('kevin-mwangi','Kevin Mwangi','UX & Design Lead','Design','Kenya','Nairobi',false,'{English}',6,4.9,88,88,'{"UX Design","Product Design",Branding}','/images/sd75by8ns0j4qabn92ryzmvjp988v394.jpg'),
('aisha-hassan','Aisha Hassan','Software Engineer','Technology','Kenya','Mombasa',true,'{English,Swahili}',5,4.8,54,54,'{"Web Development",JavaScript,React}','/images/sd76649zdx97w9ve28wfndra6d88vdek.jpg'),
('daniel-kiprop','Daniel Kiprop','Financial Advisor','Finance','Kenya','Eldoret',true,'{English,Swahili}',14,4.8,95,95,'{"Financial Planning",Investing,Budgeting}','/images/sd7cb0223na4m9xntwvezwxyz588veqn.jpg');

insert into programs (slug, title, category, level, weeks, lessons, mentor_slug, rating, enrolled, badge, cover_url, description) values
('leadership-mastery','Leadership Mastery Program','Leadership','Beginner',8,24,'jane-wanjiku',4.9,1240,'Bestseller','/images/sd7cxyvmncgt75zcbvkjs66p7s88tgjf.jpg','Build the confidence, clarity, and skills to lead teams and projects with impact.'),
('career-accelerator','Career Accelerator Bootcamp','Business','Intermediate',6,18,'jane-wanjiku',4.8,980,'Popular','/images/sd7fbrdmwf1ba8zryhj7mxhy6188vaw2.jpg','Fast-track your career in 6 weeks with a structured, mentor-led plan.'),
('startup-founder','Startup Founder Bootcamp','Business','Intermediate',10,30,'john-kamau',4.8,760,null,'/images/sd7cw7fxc5jdak3bhrek7g334188tm52.jpg','From idea to launch: validation, fundraising, and growth for African founders.'),
('fullstack-web','Full-Stack Web Development','Technology','Beginner',12,48,'brian-otieno',4.9,1530,'New','/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg','Become a job-ready developer building real projects with modern tools.'),
('data-science','Data Science Fundamentals','Data','Intermediate',8,32,'lillian-anyango',4.9,870,null,'/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg','Learn analytics, machine learning, and how to break into data careers.'),
('digital-marketing','Digital Marketing Mastery','Marketing','Beginner',6,20,'david-ochieng',4.7,1100,null,'/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg','SEO, social, and growth tactics that win customers across Africa.'),
('personal-finance','Personal Finance & Investing','Finance','Beginner',4,12,'grace-wairimu',4.8,640,null,'/images/sd7etkz00sjcxwh28x3znyxh6s88vj12.jpg','Take control of your money, build savings, and start investing wisely.'),
('ux-design','UX Design Essentials','Design','Beginner',8,26,'kevin-mwangi',4.9,720,null,'/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg','Design products people love, from research to polished interfaces.'),
('product-management','Product Management 101','Technology','Intermediate',8,24,'samuel-njoroge',4.8,590,null,'/images/sd7fbrdmwf1ba8zryhj7mxhy6188vaw2.jpg','Learn to lead products and ship features that matter.');
