-- AI-English: gamification Phase 4a — teacher view and bonus XP (docs/gamification-design.md
-- §7.1, §7.2). Class challenges (§7.3) come in a separate migration.
--
-- Bonus XP: a teacher gives a connected student 1–50 XP with a required reason, at most
-- TEACHER_BONUS_WEEKLY_CAP (50, src/lib/gamification/constants.ts) per student per week
-- (Monday–Sunday, Europe/Budapest) across all their teachers. It is an xp_events row of
-- type teacher.bonus with awarded_by = the teacher and reason set, written by
-- api/gamification.ts (?action=bonus) through record_xp_event(). It adds to the student's
-- XP and level but never counts as an active day (awarded_by is set).

-- The amount comes from the teacher, so base_xp stays 0 and no cap is set here; the weekly
-- cap is enforced by the API.
update public.gamification_activity_types set enabled = true where key = 'teacher.bonus';

-- When the student last saw their teacher bonuses (the one-time toast).
alter table public.learner_gamification add column bonus_seen_at timestamptz;

-- Gamification state of every student a teacher is actively connected to, with each
-- student's finished weeks closed first. Students with no gamification row yet get the
-- defaults. The daily_streak expression matches gamification_state().
create or replace function public.teacher_class_gamification(p_teacher_id uuid)
returns table (
  student_id uuid,
  total_xp int,
  level int,
  week_goal_days int,
  week_active_days int,
  week_xp int,
  week_streak int,
  best_week_streak int,
  daily_streak int,
  last_active_date date,
  last_week_goal_met boolean
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
  r record;
begin
  for r in
    select l.student_id from public.teacher_student_links l
    where l.teacher_id = p_teacher_id and l.status = 'active'
  loop
    perform public.gamification_close_weeks(r.student_id);
  end loop;

  return query
  select
    l.student_id,
    coalesce(g.total_xp, 0),
    coalesce(g.level, 1),
    coalesce(wp.goal_days, g.weekly_goal_days, c_default_goal),
    coalesce(wp.active_days, 0),
    coalesce(wp.xp, 0),
    coalesce(g.week_streak, 0),
    coalesce(g.best_week_streak, 0),
    case
      when g.last_active_date is null then 0
      when v_today - g.last_active_date - 1 <= g.freezes then g.daily_streak
      else 0
    end,
    g.last_active_date,
    lw.goal_met
  from public.teacher_student_links l
  left join public.learner_gamification g on g.user_id = l.student_id
  left join public.weekly_progress wp on wp.user_id = l.student_id and wp.week_start = v_week
  left join public.weekly_progress lw on lw.user_id = l.student_id and lw.week_start = v_week - 7
  where l.teacher_id = p_teacher_id and l.status = 'active';
end;
$$;

-- Called only from api/gamification.ts via supabaseAdmin, with p_teacher_id from the
-- verified JWT of a user whose role is teacher.
revoke all on function public.teacher_class_gamification(uuid) from public, anon, authenticated;
grant execute on function public.teacher_class_gamification(uuid) to service_role;
