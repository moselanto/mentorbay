-- MentorBay - link existing mentor-created programs to the mentor's public slug.
-- Without mentor_slug, the programs->mentors join returns null, so the program
-- shows "by MentorBay" with no avatar. Run in the Supabase SQL Editor.
update public.programs p
set mentor_slug = m.slug
from public.mentors m
where m.profile_id = p.created_by
  and (p.mentor_slug is null or p.mentor_slug = '');

-- Recompute mentor program ratings is unaffected; nothing else needed.
