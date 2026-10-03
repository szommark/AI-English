-- AI-English: gamification Phase 1 — XP core (docs/gamification-design.md §3, §4.1, §9).
--
-- Three tables: the activity-type registry, the append-only XP ledger and per-learner
-- totals. Every write is service-role, from api/_lib/gamification.ts (awardXp). The
-- browser never writes these tables and never sends an XP amount.
--
-- Section keys are the src/data/features.ts ids. Sections the design calls
-- vocabulary-builder / erettsegi-prep / nyelvvizsga-prep are `vocabulary` and one
-- `exam-prep` feature in features.ts, so their types are keyed under those ids, with
-- the exam kind in `module`.

create table public.gamification_activity_types (
  key text primary key,
  section text not null,
  module text,
  base_xp int not null check (base_xp >= 0),
  -- Null = no performance bonus (effort XP only).
  bonus_source text,
  daily_xp_cap int check (daily_xp_cap >= 0),
  weekly_xp_cap int check (weekly_xp_cap >= 0),
  -- Types sharing a group share one weekly cap (e.g. all mock-exam types: 'exam').
  weekly_cap_group text,
  repeat_rule text not null check (repeat_rule in ('24h_diminishing', 'sitting_effort_only', 'none')),
  -- May the browser trigger this type through /api/gamification?action=award?
  client_awardable boolean not null,
  enabled boolean not null,
  created_at timestamptz not null default now()
);

alter table public.gamification_activity_types enable row level security;

create policy "Signed-in users can read activity types"
  on public.gamification_activity_types for select
  to authenticated
  using (true);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_type text not null references public.gamification_activity_types (key),
  item_ref text,
  language text not null default 'en' check (language in ('en', 'de')),
  base_xp int not null,
  bonus_xp int not null,
  performance_score numeric,
  -- Capped activities are recorded with 0 XP and capped = true: they still count as
  -- practice (Phase 2 weekly goal).
  capped boolean not null default false,
  awarded_by uuid,
  reason text,
  created_at timestamptz not null default now()
);

create index xp_events_user_type_created_idx on public.xp_events (user_id, activity_type, created_at);
create index xp_events_user_created_idx on public.xp_events (user_id, created_at);

alter table public.xp_events enable row level security;

create policy "Users can read their own XP events"
  on public.xp_events for select
  using (auth.uid() = user_id);

create table public.learner_gamification (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_xp int not null default 0,
  level int not null default 1,
  updated_at timestamptz
);

alter table public.learner_gamification enable row level security;

create policy "Users can read their own gamification row"
  on public.learner_gamification for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies on any of the three tables: writes are service-role only.

-- Level for a cumulative XP total. Cumulative XP to reach level L is
--   LEVEL_BASE_STEP·(L−1) + LEVEL_STEP_INCREMENT·(L−1)·(L−2)/2
-- KEEP IN SYNC with LEVEL_BASE_STEP / LEVEL_STEP_INCREMENT in
-- src/lib/gamification/constants.ts and levelFromTotalXp in src/lib/gamification/levels.ts.
create or replace function public.gamification_level_for_xp(p_total_xp int)
returns int
language plpgsql
immutable
set search_path = public
as $$
declare
  c_base_step constant int := 100;      -- LEVEL_BASE_STEP
  c_step_increment constant int := 20;  -- LEVEL_STEP_INCREMENT
  v_level int := 1;
begin
  while c_base_step * v_level + c_step_increment * v_level * (v_level - 1) / 2 <= coalesce(p_total_xp, 0) loop
    v_level := v_level + 1;
  end loop;
  return v_level;
end;
$$;

-- What awardXp needs to know about earlier events before computing an award. Calendar
-- day and week (Monday–Sunday) are taken in Europe/Budapest
-- (GAMIFICATION_TIMEZONE in src/lib/gamification/constants.ts — keep in sync).
--   repeats_24h      events with this activity_type + item_ref in the last 24 hours
--   has_previous     any earlier event with this activity_type + item_ref, ever
--   awarded_today    base+bonus already awarded today for this activity_type
--   awarded_week     base+bonus already awarded this week for this activity_type, or for
--                    every type sharing its weekly_cap_group when it has one
create or replace function public.xp_award_context(
  p_user_id uuid,
  p_activity_type text,
  p_item_ref text
)
returns table (repeats_24h int, has_previous boolean, awarded_today int, awarded_week int)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  c_tz constant text := 'Europe/Budapest'; -- GAMIFICATION_TIMEZONE
  v_day_start timestamptz := date_trunc('day', now() at time zone c_tz) at time zone c_tz;
  v_week_start timestamptz := date_trunc('week', now() at time zone c_tz) at time zone c_tz;
  v_group text;
begin
  select t.weekly_cap_group into v_group
    from public.gamification_activity_types t
    where t.key = p_activity_type;

  return query
  select
    (case when p_item_ref is null then 0 else (
      select count(*)::int from public.xp_events e
        where e.user_id = p_user_id and e.activity_type = p_activity_type
          and e.item_ref = p_item_ref and e.created_at > now() - interval '24 hours'
    ) end),
    (p_item_ref is not null and exists (
      select 1 from public.xp_events e
        where e.user_id = p_user_id and e.activity_type = p_activity_type and e.item_ref = p_item_ref
    )),
    (select coalesce(sum(e.base_xp + e.bonus_xp), 0)::int from public.xp_events e
      where e.user_id = p_user_id and e.activity_type = p_activity_type and e.created_at >= v_day_start),
    (select coalesce(sum(e.base_xp + e.bonus_xp), 0)::int from public.xp_events e
      where e.user_id = p_user_id and e.created_at >= v_week_start
        and (case when v_group is null then e.activity_type = p_activity_type
             else e.activity_type in (
               select t.key from public.gamification_activity_types t where t.weekly_cap_group = v_group
             ) end));
end;
$$;

-- Atomic write: inserts the ledger row, adds base+bonus to the learner's total and
-- recomputes their level, all in one transaction. Returns the new total and level and
-- the level before this event.
create or replace function public.record_xp_event(
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
returns table (total_xp int, level int, previous_level int)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_previous_level int;
  v_total int;
  v_level int;
begin
  insert into public.xp_events
    (user_id, activity_type, item_ref, language, base_xp, bonus_xp, performance_score, capped, awarded_by, reason)
  values
    (p_user_id, p_activity_type, p_item_ref, coalesce(p_language, 'en'), p_base_xp, p_bonus_xp,
     p_performance_score, p_capped, p_awarded_by, p_reason);

  insert into public.learner_gamification (user_id, total_xp, level, updated_at)
  values (p_user_id, 0, 1, now())
  on conflict (user_id) do nothing;

  select g.level into v_previous_level
    from public.learner_gamification g
    where g.user_id = p_user_id
    for update;

  update public.learner_gamification g
    set total_xp = g.total_xp + p_base_xp + p_bonus_xp,
        level = public.gamification_level_for_xp(g.total_xp + p_base_xp + p_bonus_xp),
        updated_at = now()
    where g.user_id = p_user_id
  returning g.total_xp, g.level into v_total, v_level;

  return query select v_total, v_level, v_previous_level;
end;
$$;

-- Both called only from api/_lib/gamification.ts via supabaseAdmin, with p_user_id taken
-- from the verified JWT. Open to the browser, record_xp_event would let anyone mint XP.
revoke all on function public.xp_award_context(uuid, text, text) from public, anon, authenticated;
grant execute on function public.xp_award_context(uuid, text, text) to service_role;
revoke all on function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text) from public, anon, authenticated;
grant execute on function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text) to service_role;

-- Seed registry (design §3.3 / §3.4; D7 values pending Mark's review). Only the four
-- active Phase 1 sections are enabled. Turning another section on later is a data change:
-- `update gamification_activity_types set enabled = true where key = '...'` plus its
-- award call.
--
-- conversational-english: both modes finish in api/chat.ts (6 learner turns + feedback),
-- so both are awarded server-side: "Teszt mód" = scenario_live, "Gyakorlás" = rehearsal.
-- grammar-coach.exercise completes only in the browser (a lesson played to the end) →
-- client_awardable. pronunciation-session.deep_check is awarded in api/pronunciation.ts
-- (?action=log) → not client_awardable.
insert into public.gamification_activity_types
  (key, section, module, base_xp, bonus_source, daily_xp_cap, weekly_xp_cap, weekly_cap_group, repeat_rule, client_awardable, enabled)
values
  ('conversational-english.scenario_live', 'conversational-english', 'live', 20, 'scenario_feedback', 60, null, null, '24h_diminishing', false, true),
  ('conversational-english.rehearsal', 'conversational-english', 'rehearsal', 10, null, 30, null, null, '24h_diminishing', false, true),
  ('tutor-bot.conversation', 'tutor-bot', null, 15, null, 45, null, null, 'none', false, true),
  ('grammar-coach.exercise', 'grammar-coach', null, 10, 'correctness', 80, null, null, '24h_diminishing', true, true),
  ('pronunciation-session.funnel_stage', 'pronunciation-session', 'sound-bank', 10, 'accuracy', 100, null, null, '24h_diminishing', true, true),
  ('pronunciation-session.swipe_set', 'pronunciation-session', 'sound-bank', 5, 'accuracy', 50, null, null, '24h_diminishing', true, true),
  ('pronunciation-session.deep_check', 'pronunciation-session', 'sound-bank', 5, 'azure_score', 50, null, null, '24h_diminishing', false, true),
  ('pronunciation-session.stress_drill', 'pronunciation-session', 'stress-patterns', 10, 'accuracy', 80, null, null, '24h_diminishing', true, false),
  ('pronunciation-session.connected_speech_drill', 'pronunciation-session', 'connected-speech', 10, 'accuracy', 80, null, null, '24h_diminishing', true, false),
  ('vocabulary.fast_practice', 'vocabulary', 'fast-practice', 5, 'accuracy', 40, null, null, '24h_diminishing', true, false),
  ('vocabulary.srs_review', 'vocabulary', 'spaced-repetition', 10, 'recall_rate', 60, null, null, 'none', true, false),
  ('vocabulary.srs_all_due_cleared', 'vocabulary', 'spaced-repetition', 10, null, 10, null, null, 'none', false, false),
  ('vocabulary.game', 'vocabulary', 'games', 5, 'game_score', 40, null, null, '24h_diminishing', true, false),
  ('vocabulary.teacher_list_completed', 'vocabulary', 'teacher-lists', 30, null, null, null, null, 'none', false, false),
  ('exam-prep.erettsegi_section_complete', 'exam-prep', 'erettsegi', 30, 'raw_score', null, 600, 'exam', 'sitting_effort_only', false, false),
  ('exam-prep.erettsegi_writing_task', 'exam-prep', 'erettsegi', 20, 'rubric_score', null, 600, 'exam', 'none', false, false),
  ('exam-prep.erettsegi_paper_complete', 'exam-prep', 'erettsegi', 50, null, null, 600, 'exam', 'sitting_effort_only', false, false),
  ('exam-prep.nyelvvizsga_section_complete', 'exam-prep', 'nyelvvizsga', 30, 'raw_score', null, 600, 'exam', 'sitting_effort_only', false, false),
  ('exam-prep.nyelvvizsga_writing_task', 'exam-prep', 'nyelvvizsga', 20, 'rubric_score', null, 600, 'exam', 'none', false, false),
  ('exam-prep.nyelvvizsga_paper_complete', 'exam-prep', 'nyelvvizsga', 50, null, null, 600, 'exam', 'sitting_effort_only', false, false),
  ('live-events.attended', 'live-events', null, 40, null, null, null, null, 'none', false, false),
  ('teacher.bonus', 'teacher', null, 0, null, null, null, null, 'none', false, false),
  ('challenge.complete', 'challenge', null, 0, null, null, null, null, 'none', false, false);
