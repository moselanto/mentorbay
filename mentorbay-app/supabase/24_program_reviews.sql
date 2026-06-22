-- MentorBay - allow reviews to target a program (rating programs). Run in SQL Editor.
alter table public.reviews add column if not exists program_slug text references public.programs(slug) on delete cascade;

-- Recompute a program's rating from its visible reviews.
create or replace function public.recompute_program_rating(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.programs pr
  set rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.program_slug = p_slug and r.status = 'visible'), 0)
  where pr.slug = p_slug;
end;
$$;

create or replace function public.on_program_review_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.program_slug, old.program_slug) is not null then
    perform public.recompute_program_rating(coalesce(new.program_slug, old.program_slug));
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_program_review_change on public.reviews;
create trigger trg_program_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.on_program_review_change();
