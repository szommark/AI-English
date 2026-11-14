-- Avalon club: Wednesdays without a club.
--
-- Two kinds: Hungarian public holidays on fixed dates are skipped automatically (the movable
-- ones, Good Friday and Easter/Whit Monday, never fall on a Wednesday), and the admin closes
-- any other Wednesday (e.g. the Christmas break) in club_closed_dates. A closed Wednesday is
-- shown as "Szünet" on /club, can't be signed up for, doesn't count towards a semester's
-- remaining sessions or its "full" check, and closing it removes the single sign-ups for
-- that day (the admin gets their emails back to let them know).

create table public.club_closed_dates (
  closed_date date primary key,
  note text check (char_length(note) <= 80),
  created_at timestamptz not null default now()
);

alter table public.club_closed_dates enable row level security;

create or replace function public.club_is_holiday(p_date date)
returns boolean
language sql
immutable
as $$
  select to_char(p_date, 'MM-DD') in ('01-01', '03-15', '05-01', '08-20', '10-23', '11-01', '12-24', '12-25', '12-26');
$$;

-- A Wednesday in a semester, whether or not the club meets.
create or replace function public.club_is_wednesday(p_date date)
returns boolean
language sql
immutable
as $$
  select extract(isodow from p_date) = 3 and public.club_semester_start(p_date) is not null;
$$;

-- A Wednesday the club meets: not a holiday and not closed by the admin.
create or replace function public.club_is_session(p_date date)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.club_is_wednesday(p_date)
    and not public.club_is_holiday(p_date)
    and not exists (select 1 from public.club_closed_dates c where c.closed_date = p_date);
$$;

-- Now also lists closed Wednesdays (is_closed), so /club can show the break.
drop function public.club_sessions(integer);
create function public.club_sessions(p_count integer default 6)
returns table (session_date date, semester_start date, is_full boolean, is_closed boolean, mine text)
language sql
security definer
stable
set search_path = public
as $$
  select d::date,
    public.club_semester_start(d::date),
    public.club_session_count(d::date) >= 16,
    not public.club_is_session(d::date),
    case
      when exists (select 1 from public.club_registrations r where r.user_id = auth.uid() and r.kind = 'semester'
                   and r.semester_start = public.club_semester_start(d::date)) then 'semester'
      when exists (select 1 from public.club_registrations r where r.user_id = auth.uid() and r.kind = 'session'
                   and r.session_date = d::date) then 'session'
    end
  from generate_series(current_date, current_date + 400, interval '1 day') d
  where public.club_is_wednesday(d::date)
  order by d
  limit least(greatest(p_count, 1), 20);
$$;

-- Same as before, counting only the Wednesdays the club meets.
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
       where public.club_is_session(d::date)),
    exists (select 1 from generate_series(greatest(s, current_date), public.club_semester_end(s), interval '1 day') d
       where public.club_is_session(d::date) and public.club_session_count(d::date) >= 16),
    exists (select 1 from public.club_registrations r where r.user_id = auth.uid() and r.kind = 'semester' and r.semester_start = s)
  from sems
  order by s;
$$;

-- Same as before; the semester "full" check skips closed Wednesdays.
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
    -- Every remaining club Wednesday needs a place; the caller's own single sign-ups already hold one.
    if exists (
      select 1 from generate_series(greatest(v_start, current_date), public.club_semester_end(v_start), interval '1 day') d
      where public.club_is_session(d::date)
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

-- Admins: Wednesdays closed from today on.
create or replace function public.admin_club_closed_dates()
returns table (closed_date date, note text)
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
    select c.closed_date, c.note from public.club_closed_dates c
    where c.closed_date >= current_date
    order by c.closed_date;
end;
$$;

-- Admins: close a Wednesday. Removes that day's single sign-ups and returns their emails.
create or replace function public.admin_club_close_date(p_date date, p_note text default null)
returns table (email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() is distinct from 'admin' then
    raise exception 'admin only';
  end if;
  if p_date is null or not public.club_is_wednesday(p_date) then
    raise exception 'not a club Wednesday';
  end if;

  insert into public.club_closed_dates (closed_date, note)
  values (p_date, nullif(trim(p_note), ''))
  on conflict (closed_date) do update set note = excluded.note;

  return query
    with removed as (
      delete from public.club_registrations r
      where r.kind = 'session' and r.session_date = p_date
      returning r.user_id
    )
    select u.email::text from removed join auth.users u on u.id = removed.user_id;
end;
$$;

-- Admins: open a closed Wednesday again.
create or replace function public.admin_club_open_date(p_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if public.current_user_role() is distinct from 'admin' then
    raise exception 'admin only';
  end if;
  delete from public.club_closed_dates where closed_date = p_date;
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

revoke all on function public.club_sessions(integer) from public;
revoke all on function public.admin_club_closed_dates() from public;
revoke all on function public.admin_club_close_date(date, text) from public;
revoke all on function public.admin_club_open_date(date) from public;
grant execute on function public.club_sessions(integer) to anon, authenticated, service_role;
grant execute on function public.admin_club_closed_dates() to authenticated, service_role;
grant execute on function public.admin_club_close_date(date, text) to authenticated, service_role;
grant execute on function public.admin_club_open_date(date) to authenticated, service_role;
