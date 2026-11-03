-- AI-English: gamification revamp (docs/gamification-design.md v2.7).
--
-- 1. XP for three features built after the gamification phases:
--      exam-prep.speaking_task            a speaking exam task the AI examiner assessed (server)
--                                         10 XP per task + ≤5 by the estimated score; shares
--                                         the 600/week exam cap; a retake earns no score bonus
--      pronunciation-session.shadowing_set a finished Word list / Conversation shadowing run
--                                         (browser-completed) 10 XP + ≤5 by Azure's average; 60/day
--      tests.comp_test                    a comprehension test a teacher assigned, handed in
--                                         (server, once per assignment) 20 XP + ≤10 by the score
-- 2. More badge metrics (gamification_badge_metrics gains columns; the first two are unchanged).
-- 3. 15 proverbs and 15 badges: Grammar Coach, mini courses, speaking exam, shadowing,
--    comprehension tests, GROW goals, and two hidden ones (Bug hunter, All-rounder).
-- Lyrics gap-fill gets nothing: it has no student side (print and class mode only).

-- 1. Registry.
insert into public.gamification_activity_types
  (key, section, module, base_xp, bonus_source, daily_xp_cap, weekly_xp_cap, weekly_cap_group, repeat_rule, client_awardable, enabled)
values
  ('exam-prep.speaking_task', 'exam-prep', 'speaking', 10, 'raw_score', null, 600, 'exam', 'sitting_effort_only', false, true),
  ('pronunciation-session.shadowing_set', 'pronunciation-session', 'shadowing', 10, 'azure_score', 60, null, null, '24h_diminishing', true, true),
  ('tests.comp_test', 'tests', null, 20, 'raw_score', null, null, null, 'none', false, true);

-- 2. Badge metrics. The return type changes, so the function is dropped first; the code
-- deployed before this migration reads only the first two columns, which stay the same.
drop function if exists public.gamification_badge_metrics(uuid);

create function public.gamification_badge_metrics(p_user_id uuid)
returns table (
  words_practised int,
  srs_review_days int,
  -- Distinct Grammar Coach tense reviews (`xx-tense-review-N`) finished, either way of practising.
  tense_reviews_done int,
  -- Areas with an XP event of the learner's own (teacher bonuses and challenge rewards left out).
  active_sections int,
  courses_completed int,
  -- Goals the teacher has started with the learner (pending ones don't count).
  goals_set int,
  goal_milestones_done int,
  goals_achieved int,
  -- Problem reports of the learner's that an admin marked fixed.
  reports_fixed int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(e.units) filter (
      where e.activity_type in ('vocabulary.srs_review', 'vocabulary.fast_practice', 'vocabulary.game')), 0)::int,
    (count(distinct (e.created_at at time zone 'Europe/Budapest')::date)  -- GAMIFICATION_TIMEZONE
      filter (where e.activity_type = 'vocabulary.srs_review'))::int,
    (count(distinct split_part(e.item_ref, '/', 1))
      filter (where e.activity_type = 'grammar-coach.exercise' and e.item_ref ~ '^[a-c][12]-tense-review-[0-9]+(/|$)'))::int,
    (count(distinct t.section) filter (where t.section not in ('teacher', 'challenge')))::int,
    (select count(*) from public.course_enrollments c where c.student_id = p_user_id and c.completed_at is not null)::int,
    (select count(*) from public.learner_goals g where g.student_id = p_user_id and g.status <> 'pending')::int,
    (select count(*) from public.goal_milestones m join public.learner_goals g on g.id = m.goal_id
      where g.student_id = p_user_id and m.completed_at is not null)::int,
    (select count(*) from public.learner_goals g where g.student_id = p_user_id and g.status = 'achieved')::int,
    (select count(*) from public.feedback_reports f where f.user_id = p_user_id and f.status = 'fixed')::int
  from public.xp_events e
  left join public.gamification_activity_types t on t.key = e.activity_type
  where e.user_id = p_user_id and e.awarded_by is null;
$$;

revoke all on function public.gamification_badge_metrics(uuid) from public, anon, authenticated;
grant execute on function public.gamification_badge_metrics(uuid) to service_role;

-- 3. Categories for the new badge groups.
alter table public.badge_definitions drop constraint badge_definitions_category_check;
alter table public.badge_definitions add constraint badge_definitions_category_check check (category in (
  'milestone', 'mastery', 'consistency', 'conversation', 'vocabulary', 'exam', 'hidden', 'challenge',
  'grammar', 'courses', 'tests', 'goals'
));

-- Wisdoms. Pairings approved by the user (2026-11-03). The All-rounder one is a line from
-- H. G. Wells, The Time Machine (1895), chosen by the user; its Hungarian is a translation.
insert into public.wisdoms (id, text, text_language, hungarian_equivalent, theme_tags, reviewed) values
  ('walk-before-run', 'Learn to walk before you run.', 'en', 'Előbb tanulj meg járni, aztán futni.', '{grammar,start}', true),
  ('little-strokes', 'Little strokes fell great oaks.', 'en', 'Egy csapásra nem dől ki a fa.', '{grammar,consistency}', true),
  ('time-and-tide', 'Time and tide wait for no man.', 'en', 'Az idő senkire sem vár.', '{grammar,tenses}', true),
  ('thousand-miles', 'A journey of a thousand miles begins with a single step.', 'en', 'Ezer mérföldes út is egyetlen lépéssel kezdődik.', '{courses,start}', true),
  ('end-crowns', 'The end crowns the work.', 'en', 'Végén csattan az ostor.', '{courses,effort}', true),
  ('fortune-bold', 'Fortune favours the bold.', 'en', 'Bátraké a szerencse.', '{exam,speaking,courage}', true),
  ('imitation-flattery', 'Imitation is the sincerest form of flattery.', 'en', 'Az utánzás a legőszintébb hízelgés.', '{pronunciation,start}', true),
  ('habit-second-nature', 'Habit is second nature.', 'en', 'A megszokás második természet.', '{pronunciation,consistency}', true),
  ('look-before-leap', 'Look before you leap.', 'en', 'Előbb gondolkodj, aztán cselekedj.', '{tests,start}', true),
  ('pen-mightier', 'The pen is mightier than the sword.', 'en', 'A toll hatalmasabb a kardnál.', '{tests,progress}', true),
  ('first-things-first', 'First things first.', 'en', 'Először a legfontosabb.', '{goals,start}', true),
  ('step-by-step', 'Step by step one goes a long way.', 'en', 'Lépésről lépésre.', '{goals,progress}', true),
  ('actions-louder', 'Actions speak louder than words.', 'en', 'A tettek beszélnek.', '{goals,effort}', true),
  ('silver-lining', 'Every cloud has a silver lining.', 'en', 'Minden rosszban van valami jó.', '{feedback}', true),
  ('intellectual-versatility', 'Intellectual versatility is the compensation for change, danger, and trouble.', 'en',
   'A szellemi sokoldalúság a változás, a veszély és a nehézségek ellentételezése.', '{explore,variety}', true);

-- Badges. Criteria metrics: tense_reviews_done, active_sections, courses_completed,
-- goals_set, goal_milestones_done, goals_achieved, reports_fixed (gamification_badge_metrics).
insert into public.badge_definitions
  (key, section, category, criteria_type, params, name_hu, name_en, criteria_hu, criteria_en, icon, hidden, wisdom_id, sort_order)
values
  ('grammar_first', 'grammar-coach', 'grammar', 'event_count', '{"activity_types": ["grammar-coach.exercise"], "count": 1}',
   'Első nyelvtanlecke', 'First grammar lesson', 'Fejezz be egy leckét vagy gyakorlatot a Nyelvtani segítőben.', 'Finish a lesson or exercise in Grammar Coach.', 'SpellCheck', false, 'walk-before-run', 330),
  ('grammar_25', 'grammar-coach', 'grammar', 'event_count', '{"activity_types": ["grammar-coach.exercise"], "count": 25}',
   '25 nyelvtanlecke', '25 grammar lessons', 'Fejezz be 25 leckét vagy gyakorlatot a Nyelvtani segítőben.', 'Finish 25 lessons or exercises in Grammar Coach.', 'Layers', false, 'little-strokes', 340),
  ('tense_reviews_all', 'grammar-coach', 'grammar', 'metric_threshold', '{"metric": "tense_reviews_done", "min": 14}',
   'Mind a 14 igeidő-ismétlés', 'All 14 tense reviews', 'Fejezd be mind a 14 igeidő-ismétlést a Nyelvtani segítőben.', 'Finish all 14 tense reviews in Grammar Coach.', 'Hourglass', false, 'time-and-tide', 350),

  ('course_unit_first', 'course-library', 'courses', 'event_count', '{"activity_types": ["courses.unit_complete"], "count": 1}',
   'Első kurzusegység', 'First course unit', 'Fejezz be egy egységet egy mini kurzusban.', 'Finish a unit of a mini course.', 'BookMarked', false, 'thousand-miles', 360),
  ('course_complete', 'course-library', 'courses', 'metric_threshold', '{"metric": "courses_completed", "min": 1}',
   'Első befejezett kurzus', 'First course finished', 'Fejezz be egy teljes mini kurzust.', 'Finish a whole mini course.', 'BadgeCheck', false, 'end-crowns', 370),

  ('shadowing_first', 'pronunciation-session', 'mastery', 'event_count', '{"activity_types": ["pronunciation-session.shadowing_set"], "count": 1}',
   'Első utánmondás', 'First shadowing set', 'Mondj végig utána egy szólistát vagy párbeszédet a Kiejtés gyakorlásban.', 'Shadow a whole word list or conversation in Pronunciation.', 'AudioWaveform', false, 'imitation-flattery', 323),
  ('shadowing_10', 'pronunciation-session', 'mastery', 'event_count', '{"activity_types": ["pronunciation-session.shadowing_set"], "count": 10}',
   '10 utánmondás', '10 shadowing sets', 'Mondj végig utána 10 szólistát vagy párbeszédet a Kiejtés gyakorlásban.', 'Shadow 10 word lists or conversations in Pronunciation.', 'Repeat2', false, 'habit-second-nature', 326),

  ('comp_test_first', null, 'tests', 'event_count', '{"activity_types": ["tests.comp_test"], "count": 1}',
   'Első teszt', 'First test handed in', 'Adj be egy tesztet, amelyet a tanárod küldött.', 'Hand in a test your teacher sent you.', 'FileCheck', false, 'look-before-leap', 540),
  ('comp_tests_5', null, 'tests', 'event_count', '{"activity_types": ["tests.comp_test"], "count": 5}',
   '5 teszt', '5 tests', 'Adj be 5 tesztet, amelyet a tanárod küldött.', 'Hand in 5 tests your teacher sent you.', 'NotebookPen', false, 'pen-mightier', 550),

  ('exam_speaking_first', 'exam-prep', 'exam', 'event_count', '{"activity_types": ["exam-prep.speaking_task"], "count": 1}',
   'Első szóbeli', 'First speaking practice', 'Végezz el egy szóbeli vizsgafeladatot az MI-vizsgáztatóval, és kérj értékelést.', 'Do a speaking exam task with the AI examiner and get it assessed.', 'Megaphone', false, 'fortune-bold', 660),

  ('goal_first', null, 'goals', 'metric_threshold', '{"metric": "goals_set", "min": 1}',
   'Első cél', 'First goal set', 'Tűzz ki egy célt a tanároddal.', 'Set a goal with your teacher.', 'Goal', false, 'first-things-first', 710),
  ('goal_milestone_first', null, 'goals', 'metric_threshold', '{"metric": "goal_milestones_done", "min": 1}',
   'Első mérföldkő', 'First milestone reached', 'Végezd el egy mérföldkő minden feladatát a célodban.', 'Finish every task of a milestone in your goal.', 'Milestone', false, 'step-by-step', 720),
  ('goal_achieved', null, 'goals', 'metric_threshold', '{"metric": "goals_achieved", "min": 1}',
   'Elért cél', 'Goal reached', 'Érj el egy célt (a tanárod jelöli elértnek).', 'Reach a goal (your teacher marks it as reached).', 'PartyPopper', false, 'actions-louder', 730),

  ('bug_hunter', null, 'hidden', 'metric_threshold', '{"metric": "reports_fixed", "min": 1}',
   'Hibavadász', 'Bug hunter', 'Jelezz egy hibát, amelyet aztán kijavítunk.', 'Report a problem that then gets fixed.', 'Bug', true, 'silver-lining', 920),
  ('all_rounder', null, 'hidden', 'metric_threshold', '{"metric": "active_sections", "min": 6}',
   'Sokoldalú', 'All-rounder', 'Szerezz XP-t legalább 6 különböző területen.', 'Earn XP in at least 6 different areas.', 'Shapes', true, 'intellectual-versatility', 930);
