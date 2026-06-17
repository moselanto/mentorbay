-- OPTIONAL: light up YOUR dashboard with sample data.
-- 1) Sign up / log in once so your profile row exists.
-- 2) Copy your user id (shown on the /account page, or Auth > Users in Supabase).
-- 3) Paste it below in place of YOUR_USER_ID and run this whole block.

do $$
declare uid uuid := 'YOUR_USER_ID';
begin
  -- Enroll you in the first two available programs
  insert into enrollments (user_id, program_slug, progress, status)
  select uid, slug, 60, 'active' from programs order by created_at limit 2
  on conflict (user_id, program_slug) do nothing;

  -- A few sessions (mentor left null for the demo)
  insert into sessions (mentor_id, mentee_id, topic, mode, scheduled_at, status) values
    (null, uid, 'Career roadmap review', 'Google Meet', now() + interval '1 day',  'upcoming'),
    (null, uid, 'Mock interview practice', 'Zoom',       now() + interval '5 days', 'upcoming'),
    (null, uid, 'Goal setting',            'Google Meet', now() - interval '7 days', 'past');

  -- A pending application addressed to you (useful when your role is 'mentor')
  insert into applications (mentee_id, mentor_id, note, status)
  values (uid, uid, 'Sample application - I would love your guidance on growing into a lead role.', 'pending');
end $$;
