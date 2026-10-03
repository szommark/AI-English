-- AI-English: gamification Phase 2 — weekly goal, week streak, gentle daily streak, freezes
-- (docs/gamification-design.md §5).
--
-- Active day: any finished learner activity recorded in xp_events (also when capped or a
-- 0 XP repeat), counted per calendar day in Europe/Budapest. Week: Monday–Sunday,
-- Europe/Budapest.
--
-- No cron job: weeks are closed on demand by gamification_close_weeks(), which is safe
-- to call any number of times and closes every finished week the learner hasn't had
-- closed yet. record_xp_event() and gamification_state() call it, so a learner's state
-- is up to date whenever they practise or the app loads their level.
--
-- Constants (KEEP IN SYNC with src/lib/gamification/constants.ts):
--   MAX_FREEZES = 2, WEEKLY_GOAL_MIN_DAYS = 2, WEEKLY_GOAL_MAX_DAYS = 5,
--   DEFAULT_WEEKLY_GOAL_DAYS = 3, GAMIFICATION_TIMEZONE = 'Europe/Budapest'.

alter table public.learner_gamification
  -- The learner's chosen goal. A change applies from next week: the current week keeps
  -- the goal stored on its weekly_progress row.
  add column weekly_goal_days int not null default 3 check (weekly_goal_days between 2 and 5),
  -- Consecutive closed weeks with the goal met (the headline streak).
  add column week_streak int not null default 0,
  add column best_week_streak int not null default 0,
  -- Consecutive active days as of last_active_date. Read through gamification_state(),
  -- which shows 0 once the streak has lapsed beyond what the freezes can cover.
  add column daily_streak int not null default 0,
  -- One earned per week with the goal met; each covers one missed day, used silently.
  add column freezes int not null default 0 check (freezes between 0 and 2),
  add column last_active_date date,
  -- Set when a daily streak of 2+ days lapsed and a new one started that day (for the
  -- neutral "new streak" note).
  add column daily_streak_restarted_on date,
  -- Monday of the most recent week gamification_close_weeks() has closed.
  add column last_closed_week date;

create table public.weekly_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Monday of the week, Europe/Budapest.
  week_start date not null,
  active_days int not null default 0,
  -- The goal in force for this week (snapshot of weekly_goal_days when the row was made).
  goal_days int not null,
  -- Null while the week is open; set when it is closed.
  goal_met boolean,
  xp int not null default 0,
  exam_xp int not null default 0,
  primary key (user_id, week_start)
);

alter table public.weekly_progress enable row level security;

create policy "Users can read their own weekly progress"
  on public.weekly_progress for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies: writes are service-role only, through the functions below.

-- Closes every finished week since the last one closed (or since the learner's first
-- week): marks goal_met, updates the week streak and grants freezes. Weeks without any
-- activity get an empty row and count as missed. Safe to call any number of times.
create or replace function public.gamification_close_weeks(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c_tz constant text := 'Europe/Budapest';  -- GAMIFICATION_TIMEZONE
  c_max_freezes constant int := 2;          -- MAX_FREEZES
  v_this_week date := date_trunc('week', now() at time zone c_tz)::date;
  g public.learner_gamification%rowtype;
  v_week date;
  v_goal int;
  v_active int;
  v_met boolean;
begin
  select * into g from public.learner_gamification lg where lg.user_id = p_user_id for update;
  if not found then
    return;
  end if;

  v_week := coalesce(
    g.last_closed_week + 7,
    (select min(wp.week_start) from public.weekly_progress wp where wp.user_id = p_user_id)
  );
  if v_week is null or v_week >= v_this_week then
    return;
  end if;

  while v_week < v_this_week loop
    select wp.goal_days, wp.active_days into v_goal, v_active
      from public.weekly_progress wp
      where wp.user_id = p_user_id and wp.week_start = v_week;
    if not found then
      v_goal := g.weekly_goal_days;
      v_active := 0;
      insert into public.weekly_progress (user_id, week_start, active_days, goal_days)
        values (p_user_id, v_week, 0, v_goal);
    end if;

    v_met := v_active >= v_goal;
    update public.weekly_progress wp set goal_met = v_met
      where wp.user_id = p_user_id and wp.week_start = v_week;

    if v_met then
      g.week_streak := g.week_streak + 1;
      g.best_week_streak := greatest(g.best_week_streak, g.week_streak);
      g.freezes := least(c_max_freezes, g.freezes + 1);
    else
      g.week_streak := 0;
    end if;
    g.last_closed_week := v_week;
    v_week := v_week + 7;
  end loop;

  update public.learner_gamification lg
    set week_streak = g.week_streak,
        best_week_streak = g.best_week_streak,
        freezes = g.freezes,
        last_closed_week = g.last_closed_week
    where lg.user_id = p_user_id;
end;
$$;

-- record_xp_event gains streak tracking and a fourth return column, so it is dropped and
-- recreated (a function's return type can't be changed in place).
drop function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text);

-- Atomic write: inserts the ledger row, closes any finished weeks, adds the XP to the
-- learner's total, level and this week's progress, and — for the learner's own activity
-- (awarded_by is null) on the first event of a day — counts the active day and moves the
-- daily streak (missed days are covered by freezes when there are enough, silently).
-- Returns the new total and level, the previous level, and whether this event is the one
-- that reached this week's goal.
create function public.record_xp_event(
  p_user_id uuid,
  p_activity_type text,
  p_item_ref text,
  p_language text,
  p_base_xp int,
  p_bonus_xp int,
  p_performance_score numeric,
  p_capped boolean,
  p_awarded_by uuid default null,
  p_reason text default null
)
returns table (total_xp int, level int, previous_level int, weekly_goal_met boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  c_tz constant text := 'Europe/Budapest';  -- GAMIFICATION_TIMEZONE
  v_today date := (now() at time zone c_tz)::date;
  v_week date := date_trunc('week', now() at time zone c_tz)::date;
  v_award int := p_base_xp + p_bonus_xp;
  v_is_exam boolean;
  v_gap int;
  v_active int;
  v_goal int;
  v_goal_met boolean := false;
  g public.learner_gamification%rowtype;
begin
  insert into public.xp_events
    (user_id, activity_type, item_ref, language, base_xp, bonus_xp, performance_score, capped, awarded_by, reason)
  values
    (p_user_id, p_activity_type, p_item_ref, coalesce(p_language, 'en'), p_base_xp, p_bonus_xp,
     p_performance_score, p_capped, p_awarded_by, p_reason);

  insert into public.learner_gamification (user_id) values (p_user_id)
    on conflict (user_id) do nothing;
  perform 1 from public.learner_gamification lg where lg.user_id = p_user_id for update;
  perform public.gamification_close_weeks(p_user_id);
  select * into g from public.learner_gamification lg where lg.user_id = p_user_id;

  select coalesce(t.weekly_cap_group = 'exam', false) into v_is_exam  -- EXAM_WEEKLY_XP_CAP_GROUP
    from public.gamification_activity_types t where t.key = p_activity_type;

  insert into public.weekly_progress (user_id, week_start, goal_days)
    values (p_user_id, v_week, g.weekly_goal_days)
    on conflict (user_id, week_start) do nothing;
  update public.weekly_progress wp
    set xp = wp.xp + v_award,
        exam_xp = wp.exam_xp + case when v_is_exam then v_award else 0 end
    where wp.user_id = p_user_id and wp.week_start = v_week;

  if p_awarded_by is null and g.last_active_date is distinct from v_today then
    if g.last_active_date is null then
      g.daily_streak := 1;
    else
      v_gap := v_today - g.last_active_date - 1;  -- missed days in between
      if v_gap < 0 then
        null;  -- last_active_date in the future (shouldn't happen): leave the streak alone
      elsif v_gap = 0 then
        g.daily_streak := g.daily_streak + 1;
      elsif v_gap <= g.freezes then
        g.freezes := g.freezes - v_gap;
        g.daily_streak := g.daily_streak + 1;
      else
        if g.daily_streak >= 2 then
          g.daily_streak_restarted_on := v_today;
        end if;
        g.daily_streak := 1;
      end if;
    end if;
    g.last_active_date := greatest(v_today, g.last_active_date);

    update public.weekly_progress wp
      set active_days = wp.active_days + 1
      where wp.user_id = p_user_id and wp.week_start = v_week
      returning wp.active_days, wp.goal_days into v_active, v_goal;
    v_goal_met := coalesce(v_active = v_goal, false);
  end if;

  update public.learner_gamification lg
    set total_xp = g.total_xp + v_award,
        level = public.gamification_level_for_xp(g.total_xp + v_award),
        daily_streak = g.daily_streak,
        freezes = g.freezes,
        last_active_date = g.last_active_date,
        daily_streak_restarted_on = g.daily_streak_restarted_on,
        updated_at = now()
    where lg.user_id = p_user_id;

  return query select g.total_xp + v_award, public.gamification_level_for_xp(g.total_xp + v_award), g.level, v_goal_met;
end;
$$;

-- Everything the header chip and its panel show, with finished weeks closed first.
-- Learners with no row yet get the defaults (nothing is created for them).
create or replace function public.gamification_state(p_user_id uuid)
returns table (
  total_xp int,
  weekly_goal_days int,
  week_goal_days int,
  week_active_days int,
  week_streak int,
  best_week_streak int,
  daily_streak int,
  freezes int,
  active_today boolean,
  streak_restarted_today boolean
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  c_tz constant text := 'Europe/Budapest';  -- GAMIFICATION_TIMEZONE
  c_default_goal constant int := 3;         -- DEFAULT_WEEKLY_GOAL_DAYS
  v_today date := (now() at time zone c_tz)::date;
  v_week date := date_trunc('week', now() at time zone c_tz)::date;
begin
  perform public.gamification_close_weeks(p_user_id);

  return query
  select
    coalesce(g.total_xp, 0),
    coalesce(g.weekly_goal_days, c_default_goal),
    coalesce(wp.goal_days, g.weekly_goal_days, c_default_goal),
    coalesce(wp.active_days, 0),
    coalesce(g.week_streak, 0),
    coalesce(g.best_week_streak, 0),
    -- A lapsed streak reads as 0; one the freezes can still cover stays alive.
    case
      when g.last_active_date is null then 0
      when v_today - g.last_active_date - 1 <= g.freezes then g.daily_streak
      else 0
    end,
    coalesce(g.freezes, 0),
    coalesce(g.last_active_date = v_today, false),
    coalesce(g.daily_streak_restarted_on = v_today, false)
  from (select 1) as one
  left join public.learner_gamification g on g.user_id = p_user_id
  left join public.weekly_progress wp on wp.user_id = p_user_id and wp.week_start = v_week;
end;
$$;

-- Sets the weekly goal from next week on: this week's row is created first (if needed)
-- with the goal in force now, so the current week keeps its goal.
create or replace function public.set_weekly_goal(p_user_id uuid, p_days int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c_tz constant text := 'Europe/Budapest';  -- GAMIFICATION_TIMEZONE
  v_week date := date_trunc('week', now() at time zone c_tz)::date;
  v_current int;
begin
  if p_days is null or p_days < 2 or p_days > 5 then  -- WEEKLY_GOAL_MIN_DAYS / MAX_DAYS
    raise exception 'weekly goal must be between 2 and 5 days';
  end if;

  insert into public.learner_gamification (user_id) values (p_user_id)
    on conflict (user_id) do nothing;
  select lg.weekly_goal_days into v_current
    from public.learner_gamification lg where lg.user_id = p_user_id for update;
  perform public.gamification_close_weeks(p_user_id);

  insert into public.weekly_progress (user_id, week_start, goal_days)
    values (p_user_id, v_week, v_current)
    on conflict (user_id, week_start) do nothing;

  update public.learner_gamification lg set weekly_goal_days = p_days, updated_at = now()
    where lg.user_id = p_user_id;
end;
$$;

-- All four are called only from api/ via supabaseAdmin, with p_user_id from the verified
-- JWT (same lockdown as 20261003140000_gamification_core.sql).
revoke all on function public.gamification_close_weeks(uuid) from public, anon, authenticated;
grant execute on function public.gamification_close_weeks(uuid) to service_role;
revoke all on function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text) from public, anon, authenticated;
grant execute on function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text) to service_role;
revoke all on function public.gamification_state(uuid) from public, anon, authenticated;
grant execute on function public.gamification_state(uuid) to service_role;
revoke all on function public.set_weekly_goal(uuid, int) from public, anon, authenticated;
grant execute on function public.set_weekly_goal(uuid, int) to service_role;

-- Backfill from the Phase 1 events recorded so far (no backfill of XP itself: this only
-- derives the week/streak state from the existing ledger rows).
insert into public.weekly_progress (user_id, week_start, active_days, goal_days, xp, exam_xp)
select
  e.user_id,
  date_trunc('week', e.created_at at time zone 'Europe/Budapest')::date,
  count(distinct (e.created_at at time zone 'Europe/Budapest')::date) filter (where e.awarded_by is null),
  3,
  sum(e.base_xp + e.bonus_xp),
  coalesce(sum(e.base_xp + e.bonus_xp) filter (where t.weekly_cap_group = 'exam'), 0)
from public.xp_events e
join public.gamification_activity_types t on t.key = e.activity_type
group by 1, 2;

with days as (
  select distinct e.user_id, (e.created_at at time zone 'Europe/Budapest')::date as day
  from public.xp_events e
  where e.awarded_by is null
),
islands as (
  select d.user_id, d.day, d.day - (row_number() over (partition by d.user_id order by d.day))::int as grp
  from days d
),
latest as (
  select distinct on (i.user_id) i.user_id, i.grp from islands i order by i.user_id, i.day desc
),
streaks as (
  select i.user_id, count(*)::int as streak, max(i.day) as last_day
  from islands i join latest l on l.user_id = i.user_id and l.grp = i.grp
  group by i.user_id
)
update public.learner_gamification lg
  set daily_streak = s.streak, last_active_date = s.last_day
  from streaks s
  where s.user_id = lg.user_id;
