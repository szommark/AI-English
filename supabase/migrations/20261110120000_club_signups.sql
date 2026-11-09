-- Avalon: sign-up counter for the on-site English club (/club).
--
-- The "Jelentkezem" button opens the visitor's email app and records one sign-up per
-- browser (the same random visitor id the QR tracking uses). No personal data is stored:
-- names and levels arrive by email. The page shows base participants (src/data/clubCopy.ts)
-- plus this count. club_key is the club edition (topic); a new key starts from zero.

create table public.club_signups (
  id bigint generated always as identity primary key,
  club_key text not null check (club_key ~ '^[a-z0-9-]{3,40}$'),
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (club_key, visitor_id)
);

-- No policies: browsers only go through the two functions below.
alter table public.club_signups enable row level security;

create or replace function public.club_signup_count(p_key text)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::integer from public.club_signups where club_key = p_key;
$$;

-- Records the sign-up (a repeat from the same browser counts once) and returns the new count.
create or replace function public.club_signup(p_key text, p_visitor uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_key is null or p_visitor is null or p_key !~ '^[a-z0-9-]{3,40}$' then
    return null;
  end if;

  insert into public.club_signups (club_key, visitor_id)
  values (p_key, p_visitor)
  on conflict (club_key, visitor_id) do nothing;

  return public.club_signup_count(p_key);
end;
$$;

revoke all on function public.club_signup_count(text) from public;
revoke all on function public.club_signup(text, uuid) from public;
grant execute on function public.club_signup_count(text) to anon, authenticated, service_role;
grant execute on function public.club_signup(text, uuid) to anon, authenticated, service_role;
