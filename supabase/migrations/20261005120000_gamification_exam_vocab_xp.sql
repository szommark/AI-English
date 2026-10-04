-- AI-English: gamification upgrade — per-word Vocabulary XP, per-task Exam Prep XP, their
-- badges, and Exam Prep as a class-challenge target (docs/gamification-design.md §3.3, §3.4,
-- §6.1, §7.3).
--
-- Vocabulary: 1 XP for every word worked on, right or wrong, at any ladder step:
--   vocabulary.srs_review     a spaced-repetition session (api/vocab.ts review-finish counts the
--                             words reviewed since the last award)            cap 100/day
--   vocabulary.fast_practice  a Fast practice round or test (drill-finish, test-finish)  50/day
--   vocabulary.game           a word-grid game (browser-completed, words checked)      50/day
-- No accuracy bonus. One ledger row per session/round/game, with the word count in `units`.
--
-- Exam Prep: 10 XP per task done + up to 5 by the section's raw score, one ledger row per
-- section (booklet) with the task count in `units`; +50 when every section of a paper is done.
-- Answers are re-scored on the server (api/_lib/examXp.ts). Retaking a paper earns no score
-- bonus (sitting_effort_only, item_ref = '<paper id>/<section id>'). Weekly cap 600 for all
-- exam types together (weekly_cap_group 'exam').

-- 1. Words or tasks behind an award (null for activities that aren't per-unit).
alter table public.xp_events add column units int check (units is null or units >= 0);

-- 2. record_xp_event stores units. Same body as 20261003150000_gamification_streaks.sql
-- otherwise; dropped and recreated, as an extra defaulted argument would make an ambiguous
-- overload for PostgREST.
drop function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text);

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
  p_reason text default null,
  p_units int default null
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
    (user_id, activity_type, item_ref, language, base_xp, bonus_xp, performance_score, capped, awarded_by, reason, units)
  values
    (p_user_id, p_activity_type, p_item_ref, coalesce(p_language, 'en'), p_base_xp, p_bonus_xp,
     p_performance_score, p_capped, p_awarded_by, p_reason, p_units);

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

revoke all on function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text, int) from public, anon, authenticated;
grant execute on function public.record_xp_event(uuid, text, text, text, int, int, numeric, boolean, uuid, text, int) to service_role;

-- 3. Registry. base_xp is now per unit for these types (api/_lib/xpCalc.ts computeAward).
update public.gamification_activity_types
  set base_xp = 1, bonus_source = null, daily_xp_cap = 100, repeat_rule = 'none',
      client_awardable = false, enabled = true
  where key = 'vocabulary.srs_review';
update public.gamification_activity_types
  set base_xp = 1, bonus_source = null, daily_xp_cap = 50, repeat_rule = 'none'
  where key = 'vocabulary.fast_practice';
update public.gamification_activity_types
  set base_xp = 1, bonus_source = null, daily_xp_cap = 50, repeat_rule = 'none'
  where key = 'vocabulary.game';
update public.gamification_activity_types
  set base_xp = 10, bonus_source = 'raw_score', enabled = true
  where key in ('exam-prep.erettsegi_section_complete', 'exam-prep.nyelvvizsga_section_complete');
update public.gamification_activity_types
  set enabled = true
  where key in ('exam-prep.erettsegi_paper_complete', 'exam-prep.nyelvvizsga_paper_complete');
-- exam-prep.*_writing_task stay disabled: a writing section's tasks count in its section
-- event (effort XP, as writing isn't graded yet). The all-due-cleared bonus stays off too:
-- every reviewed word already pays.

-- 4. Exam Prep sections as a class-challenge target ('activities' with target_activity
-- 'exam-prep' counts sections finished; collective and individual).
alter table public.class_challenges drop constraint class_challenges_target_activity_check;
alter table public.class_challenges add constraint class_challenges_target_activity_check
  check (target_activity in (
    'any', 'conversational-english', 'tutor-bot', 'grammar-coach', 'pronunciation-session', 'exam-prep',
    'vocabulary.fast_practice', 'vocabulary.game', 'vocabulary.own_list'
  ));

-- Same as 20261004140000_gamification_challenges.sql, plus the 'exam-prep' branch (sections
-- only: the paper bonus is not a section).
create or replace function public.challenge_progress(p_challenge_id uuid)
returns table (student_id uuid, value int)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  c_tz constant text := 'Europe/Budapest';  -- GAMIFICATION_TIMEZONE
  c record;
  v_from timestamptz;
  v_to timestamptz;
begin
  select * into c from public.class_challenges ch where ch.id = p_challenge_id;
  if not found then
    return;
  end if;
  v_from := c.starts_on::timestamp at time zone c_tz;
  v_to := (c.ends_on + 1)::timestamp at time zone c_tz;

  return query
  with participants as (
    select l.student_id
    from public.teacher_student_links l
    where l.teacher_id = c.teacher_id and l.status = 'active'
      and (c.audience = 'class' or exists (
        select 1 from public.class_challenge_recipients r
        where r.challenge_id = c.id and r.student_id = l.student_id
      ))
  ),
  events as (
    select e.user_id, e.activity_type, e.base_xp + e.bonus_xp as xp, e.created_at, t.section
    from public.xp_events e
    join public.gamification_activity_types t on t.key = e.activity_type
    where e.user_id in (select p.student_id from participants p)
      and e.awarded_by is null
      and e.created_at >= v_from and e.created_at < v_to
  )
  select
    p.student_id,
    (case c.target_type
      when 'active_days' then (
        select count(distinct (ev.created_at at time zone c_tz)::date) from events ev where ev.user_id = p.student_id)
      when 'xp' then (
        select coalesce(sum(ev.xp), 0) from events ev where ev.user_id = p.student_id)
      when 'word_list' then (
        select count(*) from public.vocab_list_assignments a
        where a.list_id = c.target_list_id and a.student_id = p.student_id
          and a.completed_at is not null and a.completed_at < v_to)
      else (case c.target_activity
        when 'any' then (
          select count(*) from events ev where ev.user_id = p.student_id)
        when 'vocabulary.own_list' then (
          select count(*) from public.vocab_student_lists sl
          where sl.user_id = p.student_id and sl.created_at >= v_from and sl.created_at < v_to
            and exists (select 1 from public.vocab_student_list_items si where si.list_id = sl.id))
        when 'vocabulary.fast_practice' then (
          select count(*) from events ev where ev.user_id = p.student_id and ev.activity_type = 'vocabulary.fast_practice')
        when 'vocabulary.game' then (
          select count(*) from events ev where ev.user_id = p.student_id and ev.activity_type = 'vocabulary.game')
        when 'exam-prep' then (
          select count(*) from events ev where ev.user_id = p.student_id
            and ev.activity_type in ('exam-prep.erettsegi_section_complete', 'exam-prep.nyelvvizsga_section_complete'))
        else (
          select count(*) from events ev where ev.user_id = p.student_id and ev.section = c.target_activity)
      end)
    end)::int
  from participants p;
end;
$$;

revoke all on function public.challenge_progress(uuid) from public, anon, authenticated;
grant execute on function public.challenge_progress(uuid) to service_role;

-- 5. Badge metrics for the new badges (api/_lib/badges.ts loadFacts). Only per-word events
-- carry units, so words from before this upgrade don't count (design §9.1: start from zero).
--   words_practised   words worked on in spaced repetition, Fast practice and games
--   srs_review_days   Budapest calendar days with a finished spaced-repetition session
create or replace function public.gamification_badge_metrics(p_user_id uuid)
returns table (words_practised int, srs_review_days int)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(e.units) filter (
      where e.activity_type in ('vocabulary.srs_review', 'vocabulary.fast_practice', 'vocabulary.game')), 0)::int,
    (count(distinct (e.created_at at time zone 'Europe/Budapest')::date)  -- GAMIFICATION_TIMEZONE
      filter (where e.activity_type = 'vocabulary.srs_review'))::int
  from public.xp_events e
  where e.user_id = p_user_id and e.awarded_by is null;
$$;

revoke all on function public.gamification_badge_metrics(uuid) from public, anon, authenticated;
grant execute on function public.gamification_badge_metrics(uuid) to service_role;

-- 6. Wisdoms and badges. Seeded as reviewed: Mark reviews the pairings in the PR (design §6.3).
insert into public.wisdoms (id, text, text_language, hungarian_equivalent, theme_tags, reviewed) values
  ('first-step-hardest', 'The first step is always the hardest.', 'en', 'Minden kezdet nehéz.', '{start,exam}', true),
  ('all-well', 'All''s well that ends well.', 'en', 'Minden jó, ha a vége jó.', '{exam,effort}', true),
  ('experience-teacher', 'Experience is the best teacher.', 'en', 'A tapasztalat a legjobb tanítómester.', '{exam,learning}', true),
  ('hard-work-pays', 'Hard work pays off.', 'en', 'A munka meghozza gyümölcsét.', '{exam,effort}', true),
  ('success-breeds-success', 'Success breeds success.', 'en', 'Siker szüli a sikert.', '{exam,progress}', true),
  ('uebung-meister', 'Übung macht den Meister.', 'de', 'Gyakorlat teszi a mestert.', '{exam,german}', true),
  ('learn-every-day', 'Every day you learn something new.', 'en', 'Minden nap tanul valamit az ember.', '{vocabulary,learning}', true),
  ('repetition-mother', 'Repetition is the mother of learning.', 'en', 'Az ismétlés a tudás anyja.', '{vocabulary,progress}', true),
  ('oaks-acorns', 'Great oaks from little acorns grow.', 'en', 'Sok kicsi sokra megy.', '{vocabulary,progress}', true),
  ('never-put-off', 'Never put off till tomorrow what you can do today.', 'en', 'Amit ma megtehetsz, ne halaszd holnapra.', '{vocabulary,consistency}', true),
  ('strike-iron', 'Strike while the iron is hot.', 'en', 'Addig üsd a vasat, amíg meleg.', '{vocabulary,effort}', true),
  ('laughter-medicine', 'Laughter is the best medicine.', 'en', 'A nevetés a legjobb orvosság.', '{vocabulary,games}', true);

-- Criteria metrics: words_practised / srs_review_days (gamification_badge_metrics above);
-- exam_papers_de, exam_best_paper_percent, exam_personal_bests (from the learner's paper
-- events, api/_lib/badgeRules.ts examPaperMetrics). The German badge is hidden: most
-- learners study English and would otherwise see it locked for good.
insert into public.badge_definitions
  (key, section, category, criteria_type, params, name_hu, name_en, criteria_hu, criteria_en, icon, hidden, wisdom_id, sort_order)
values
  ('words_practised_250', 'vocabulary', 'vocabulary', 'metric_threshold', '{"metric": "words_practised", "min": 250}',
   '250 gyakorolt szó', '250 words practised', 'Gyakorolj 250 szót (ismétlés, gyors gyakorlás, szójáték).', 'Practise 250 words (spaced repetition, Fast practice, games).', 'BookOpen', false, 'learn-every-day', 440),
  ('words_practised_1000', 'vocabulary', 'vocabulary', 'metric_threshold', '{"metric": "words_practised", "min": 1000}',
   '1000 gyakorolt szó', '1,000 words practised', 'Gyakorolj 1000 szót (ismétlés, gyors gyakorlás, szójáték).', 'Practise 1,000 words (spaced repetition, Fast practice, games).', 'Library', false, 'repetition-mother', 450),
  ('words_practised_5000', 'vocabulary', 'vocabulary', 'metric_threshold', '{"metric": "words_practised", "min": 5000}',
   '5000 gyakorolt szó', '5,000 words practised', 'Gyakorolj 5000 szót (ismétlés, gyors gyakorlás, szójáték).', 'Practise 5,000 words (spaced repetition, Fast practice, games).', 'TreeDeciduous', false, 'oaks-acorns', 460),
  ('srs_days_7', 'vocabulary', 'vocabulary', 'metric_threshold', '{"metric": "srs_review_days", "min": 7}',
   'Hét ismétlős nap', 'Seven review days', 'Ismételj szavakat 7 különböző napon.', 'Review words with spaced repetition on 7 different days.', 'Repeat', false, 'never-put-off', 470),
  ('fast_practice_10', 'vocabulary', 'vocabulary', 'event_count', '{"activity_types": ["vocabulary.fast_practice"], "count": 10}',
   '10 gyors gyakorlás', '10 Fast practice rounds', 'Fejezz be 10 gyors gyakorlást vagy tesztet.', 'Finish 10 Fast practice rounds or tests.', 'Zap', false, 'strike-iron', 480),
  ('games_25', 'vocabulary', 'vocabulary', 'event_count', '{"activity_types": ["vocabulary.game"], "count": 25}',
   '25 szójáték', '25 word games', 'Fejezz be 25 szójátékot.', 'Finish 25 word games.', 'Puzzle', false, 'laughter-medicine', 490),

  ('exam_first_section', 'exam-prep', 'exam', 'event_count',
   '{"activity_types": ["exam-prep.erettsegi_section_complete", "exam-prep.nyelvvizsga_section_complete"], "count": 1}',
   'Első vizsgarész', 'First exam section', 'Adj be egy részt egy próbafeladatsorból.', 'Hand in one section of a mock exam paper.', 'PenLine', false, 'first-step-hardest', 610),
  ('exam_first_paper', 'exam-prep', 'exam', 'event_count',
   '{"activity_types": ["exam-prep.erettsegi_paper_complete", "exam-prep.nyelvvizsga_paper_complete"], "count": 1}',
   'Első teljes feladatsor', 'First full paper', 'Adj be minden részt egy próbafeladatsorból.', 'Hand in every section of a mock exam paper.', 'ClipboardCheck', false, 'all-well', 620),
  ('exam_papers_5', 'exam-prep', 'exam', 'event_count',
   '{"activity_types": ["exam-prep.erettsegi_paper_complete", "exam-prep.nyelvvizsga_paper_complete"], "count": 5}',
   '5 teljes feladatsor', '5 full papers', 'Adj be 5 teljes próbafeladatsort.', 'Hand in 5 full mock exam papers.', 'Files', false, 'experience-teacher', 630),
  ('exam_practice_60', 'exam-prep', 'exam', 'metric_threshold', '{"metric": "exam_best_paper_percent", "min": 60}',
   '60% feletti gyakorlóeredmény', 'Practice result of 60%+', 'Érj el legalább 60%-ot a feladatpontokból egy teljes próbafeladatsoron (az írás nélkül).', 'Score at least 60% of the task points on a full mock paper (writing not included).', 'Target', false, 'hard-work-pays', 640),
  ('exam_personal_best', 'exam-prep', 'exam', 'metric_threshold', '{"metric": "exam_personal_bests", "min": 1}',
   'Egyéni csúcs', 'Personal best', 'Teljes próbafeladatsoron múld felül a korábbi legjobb eredményedet ugyanabban a vizsgában.', 'Beat your previous best on a full mock paper of the same exam.', 'Medal', false, 'success-breeds-success', 650),
  ('exam_german', 'exam-prep', 'exam', 'metric_threshold', '{"metric": "exam_papers_de", "min": 1}',
   'Német feladatsor', 'German paper', 'Adj be minden részt egy német próbafeladatsorból.', 'Hand in every section of a German mock exam paper.', 'Languages', true, 'uebung-meister', 910);
