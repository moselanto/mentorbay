-- MentorBay - success stories (featured reviews) + live mentor rating. Run in SQL Editor.

-- 1) Mark a review as a featured success story.
alter table public.reviews add column if not exists featured boolean not null default false;

-- 2) Recompute a mentor's rating + review count from visible reviews.
create or replace function public.recompute_mentor_rating(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.mentors m
  set rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.mentor_slug = p_slug and r.status = 'visible'), 0),
      reviews = coalesce((select count(*) from public.reviews r where r.mentor_slug = p_slug and r.status = 'visible'), 0)
  where m.slug = p_slug;
end;
$$;

-- 3) Auto-recompute whenever a review changes.
create or replace function public.on_review_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_mentor_rating(coalesce(new.mentor_slug, old.mentor_slug));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_review_change on public.reviews;
create trigger trg_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.on_review_change();
