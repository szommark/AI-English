-- AVaLoN: the skill an "Improving a skill" goal is about. Goals are now set only by the
-- teacher, together with the student, and each goal has one "Where am I now?" scale: 0–10 on
-- the goal, or — for a skill goal — 1–10 for its one chosen skill (learner_goal_ratings.overall
-- holds that value). Null until the teacher chooses the skill; only allowed on skill goals.

alter table public.learner_goals
  -- KEEP IN SYNC with GOAL_SKILLS (src/lib/goals.ts).
  add column if not exists skill text check (skill in ('listening', 'reading', 'speaking', 'writing', 'pronunciation', 'vocabulary', 'grammar'));

alter table public.learner_goals drop constraint if exists learner_goals_skill_type_check;
alter table public.learner_goals add constraint learner_goals_skill_type_check
  check (skill is null or goal_type = 'skill');
