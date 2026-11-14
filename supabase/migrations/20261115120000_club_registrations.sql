-- Avalon: account-based sign-up for the on-site English club (/club).
--
-- The club meets every Wednesday in two semesters: September–January and February–June
-- (nothing in July and August). A signed-in user signs up for one Wednesday or for a whole
-- semester (every remaining Wednesday of it). A Wednesday is full at 16, counting the two
-- hosts (the 2 in club_session_count) plus the single-session and semester sign-ups covering
-- that date. Every function checks the caller itself, so Supabase's default execute grants
-- to anon/authenticated can't open anything up.
-- Browsers only go through the functions below; the admin list reads emails from auth.users.
-- Replaces the anonymous click counter of 20261110120000_club_signups.sql (left in place, unused).

create table public.club_registrations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('session', 'semester')),
  session_date date,
  semester_start date,
  created_at timestamptz not null default now(),
  check (
    (kind = 'session' and session_date is not null and semester_start is null)
    or (kind = 'semester' and semester_start is not null and session_date is null)
  )
);

create unique index club_registrations_session_uq on public.club_registrations (user_id, session_date) where kind = 'session';
create unique index club_registrations_semester_uq on public.club_registrations (user_id, semester_start) where kind = 'semester';
create index club_registrations_date_idx on public.club_registrations (session_date);
create index club_registrations_semester_idx on public.club_registrations (semester_start);

alter table public.club_registrations enable row level security;

-- First day of the semester a date falls in (1 Sep or 1 Feb); null in July and August.
create or replace function public.club_semester_start(p_date date)
returns date
language sql
immutable
as $$
  select case
    when extract(month from p_date) >= 9 then make_date(extract(year from p_date)::int, 9, 1)
    when extract(month from p_date) = 1 then make_date(extract(year from p_date)::int - 1, 9, 1)
    when extract(month from p_date) between 2 and 6 then make_date(extract(year from p_date)::int, 2, 1)
    else null
  end;
$$;

-- Last day of a semester: 31 Jan for the autumn one, 30 Jun for the spring one.
create or replace function public.club_semester_end(p_start date)
returns date
language sql
immutable
as $$
  select case when extract(month from p_start) = 9
    then make_date(extract(year from p_start)::int + 1, 1, 31)
    else make_date(extract(year from p_start)::int, 6, 30)
  end;
$$;

create or replace function public.club_is_session(p_date date)
returns boolean
language sql
immutable
as $$
  select extract(isodow from p_date) = 3 and public.club_semester_start(p_date) is not null;
$$;

-- People on a Wednesday: the two hosts + single sign-ups + semester sign-ups.
create or replace function public.club_session_count(p_date date)
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select 2
    + (select count(*) from public.club_registrations where kind = 'session' and session_date = p_date)::int
    + (select count(*) from public.club_registrations where kind = 'semester' and semester_start = public.club_semester_start(p_date))::int;
$$;

-- The next p_count Wednesdays (from today), how full they are and what the caller has booked.
create or replace function public.club_sessions(p_count integer default 6)
returns table (session_date date, semester_start date, is_full boolean, mine text)
language sql
security definer
stable
set search_path = public
as $$
  select d::date,
    public.club_semester_start(d::date),
    public.club_session_count(d::date) >= 16,
    case
      when exists (select 1 from public.club_registrations r where r.user_id = auth.uid() and r.kind = 'semester'
                   and r.semester_start = public.club_semester_start(d::date)) then 'semester'
      when exists (select 1 from public.club_registrations r where r.user_id = auth.uid() and r.kind = 'session'
                   and r.session_date = d::date) then 'session'
    end
  from generate_series(current_date, current_date + 400, interval '1 day') d
  where public.club_is_session(d::date)
  order by d
  limit least(greatest(p_count, 1), 20);
$$;

-- The current and the next semester: remaining Wednesdays, whether any is full, the caller's sign-up.
create or replace function public.club_semesters()
returns table (semester_start date, semester_end date, sessions_left integer, any_full boolean, mine boolean)
language sql
security definer
stable
set search_path = public
as $$
  with starts as (
    select distinct public.club_semester_start(d::date) as s
    from generate_series(current_date, current_date + 400, interval '1 day') d
    where public.club_semester_start(d::date) is not null
  ),
  sems as (select s from starts order by s limit 2)
  select s,
    public.club_semester_end(s),
    (select count(*)::int from generate_series(greatest(s, current_date), public.club_semester_end(s), interval '1 day') d
       where extract(isodow from d) = 3),
    exists (select 1 from generate_series(greatest(s, current_date), public.club_semester_end(s), interval '1 day') d
       where extract(isodow from d) = 3 and public.club_session_count(d::date) >= 16),
    exists (select 1 from public.club_registrations r where r.user_id = auth.uid() and r.kind = 'semester' and r.semester_start = s)
  from sems
  order by s;
$$;

-- Signs the caller up. Returns 'ok', 'full', 'already', 'invalid' or 'auth'.
create or replace function public.club_register(p_kind text, p_date date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_start date := public.club_semester_start(p_date);
begin
  if v_user is null then
    return 'auth';
  end if;
  if p_date is null or v_start is null then
    return 'invalid';
  end if;

  -- One sign-up at a time, so two people can't both take the 16th place.
  perform pg_advisory_xact_lock(hashtext('club_registrations'));

  if exists (select 1 from public.club_registrations
             where user_id = v_user and kind = 'semester' and semester_start = v_start) then
    return 'already';
  end if;

  if p_kind = 'session' then
    if not public.club_is_session(p_date) or p_date < current_date then
      return 'invalid';
    end if;
    if exists (select 1 from public.club_registrations
               where user_id = v_user and kind = 'session' and session_date = p_date) then
      return 'already';
    end if;
    if public.club_session_count(p_date) >= 16 then
      return 'full';
    end if;
    insert into public.club_registrations (user_id, kind, session_date) values (v_user, 'session', p_date);
    return 'ok';
  end if;

  if p_kind = 'semester' then
    if public.club_semester_end(v_start) < current_date then
      return 'invalid';
    end if;
    -- Every remaining Wednesday needs a place; the caller's own single sign-ups already hold one.
    if exists (
      select 1 from generate_series(greatest(v_start, current_date), public.club_semester_end(v_start), interval '1 day') d
      where extract(isodow from d) = 3
        and public.club_session_count(d::date)
          - (select count(*) from public.club_registrations r
             where r.user_id = v_user and r.kind = 'session' and r.session_date = d::date)::int >= 16
    ) then
      return 'full';
    end if;
    delete from public.club_registrations
      where user_id = v_user and kind = 'session'
        and session_date between v_start and public.club_semester_end(v_start);
    insert into public.club_registrations (user_id, kind, semester_start) values (v_user, 'semester', v_start);
    return 'ok';
  end if;

  return 'invalid';
end;
$$;

-- Cancels the caller's sign-up for that Wednesday or semester.
create or replace function public.club_cancel(p_kind text, p_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    return false;
  end if;
  if p_kind = 'session' then
    delete from public.club_registrations where user_id = auth.uid() and kind = 'session' and session_date = p_date;
  elsif p_kind = 'semester' then
    delete from public.club_registrations where user_id = auth.uid() and kind = 'semester'
      and semester_start = public.club_semester_start(p_date);
  end if;
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

-- Admins: everyone who comes on the next p_count Wednesdays (single and semester sign-ups).
create or replace function public.admin_club_attendees(p_count integer default 6)
returns table (session_date date, email text, kind text, created_at timestamptz)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if public.current_user_role() is distinct from 'admin' then
    raise exception 'admin only';
  end if;
  return query
    with days as (
      select d::date as day
      from generate_series(current_date, current_date + 400, interval '1 day') d
      where public.club_is_session(d::date)
      order by d
      limit least(greatest(p_count, 1), 20)
    )
    select days.day, u.email::text, r.kind, r.created_at
    from days
    join public.club_registrations r
      on (r.kind = 'session' and r.session_date = days.day)
      or (r.kind = 'semester' and r.semester_start = public.club_semester_start(days.day))
    join auth.users u on u.id = r.user_id
    order by days.day, r.created_at;
end;
$$;

revoke all on function public.club_session_count(date) from public;
revoke all on function public.club_sessions(integer) from public;
revoke all on function public.club_semesters() from public;
revoke all on function public.club_register(text, date) from public;
revoke all on function public.club_cancel(text, date) from public;
revoke all on function public.admin_club_attendees(integer) from public;
grant execute on function public.club_sessions(integer) to anon, authenticated, service_role;
grant execute on function public.club_semesters() to anon, authenticated, service_role;
grant execute on function public.club_register(text, date) to authenticated, service_role;
grant execute on function public.club_cancel(text, date) to authenticated, service_role;
grant execute on function public.admin_club_attendees(integer) to authenticated, service_role;
