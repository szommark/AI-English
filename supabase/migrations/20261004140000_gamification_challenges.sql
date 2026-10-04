-- AI-English: gamification Phase 4b — class challenges (docs/gamification-design.md §7.3),
-- plus XP for two Vocabulary activities so they can be challenge targets.
--
-- A teacher sets a time-limited goal for the students they are actively connected to:
--   collective  the class works towards one shared total (always the whole class);
--   individual  each student has the same personal target (the whole class, or selected
--               students listed in class_challenge_recipients).
-- Progress is counted on demand from the ledger and the vocabulary tables
-- (challenge_progress()); nothing is stored per student until a student completes the
-- challenge, which is recorded once in challenge_completions and pays the reward as a
-- challenge.complete XP event (awarded_by = the teacher, so it never counts as practice).
-- All writes go through api/gamification.ts and api/_lib/challenges.ts (service role).

-- Vocabulary XP (design §3.3 values, already seeded). Fast practice is finished on the server
-- (api/vocab.ts drill-finish), so it is awarded there rather than from the browser; a word grid
-- game finishes in the browser and is awarded through /api/gamification?action=award.
update public.gamification_activity_types set enabled = true, client_awardable = false
  where key = 'vocabulary.fast_practice';
update public.gamification_activity_types set enabled = true
  where key = 'vocabulary.game';
-- The reward XP of a completed challenge (amount set by the teacher, 0–50).
update public.gamification_activity_types set enabled = true
  where key = 'challenge.complete';

-- When the learner last saw new challenges (the one-time announcement).
alter table public.learner_gamification add column challenges_seen_at timestamptz;

create table public.class_challenges (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  -- Students see these; the teacher writes them (in Hungarian).
  title text not null check (char_length(title) between 3 and 80),
  description text check (description is null or char_length(description) <= 300),
  kind text not null check (kind in ('collective', 'individual')),
  -- 'selected' = only the students in class_challenge_recipients (individual challenges only).
  audience text not null default 'class' check (audience in ('class', 'selected')),
  target_type text not null check (target_type in ('active_days', 'activities', 'xp', 'word_list')),
  -- For target_type 'activities': 'any', a features.ts section id, or one of the three
  -- Vocabulary activities (individual challenges only).
  target_activity text check (target_activity in (
    'any', 'conversational-english', 'tutor-bot', 'grammar-coach', 'pronunciation-session',
    'vocabulary.fast_practice', 'vocabulary.game', 'vocabulary.own_list'
  )),
  -- For target_type 'word_list': one of the teacher's lists. Null if the list was deleted.
  target_list_id uuid references public.vocab_lists (id) on delete set null,
  -- Individual: each student's target. Collective: the class total (for word_list: how
  -- many students complete the list).
  target_value int not null check (target_value between 1 and 10000),
  -- Inclusive Budapest calendar days.
  starts_on date not null,
  ends_on date not null,
  reward_xp int not null check (reward_xp between 0 and 50),
  -- Ended early by the teacher: no completions after this.
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (kind = 'individual' or audience = 'class'),
  check ((target_type = 'activities') = (target_activity is not null)),
  check (kind = 'individual' or target_activity is null
         or target_activity not in ('vocabulary.fast_practice', 'vocabulary.game', 'vocabulary.own_list'))
);

create index class_challenges_teacher_idx on public.class_challenges (teacher_id, ends_on desc);

create table public.class_challenge_recipients (
  challenge_id uuid not null references public.class_challenges (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  primary key (challenge_id, student_id)
);

create index class_challenge_recipients_student_idx on public.class_challenge_recipients (student_id);

create table public.challenge_completions (
  challenge_id uuid not null references public.class_challenges (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  completed_at timestamptz not null default now(),
  -- What was paid (the challenge's reward_xp at completion time).
  reward_xp int not null,
  primary key (challenge_id, user_id)
);

alter table public.class_challenges enable row level security;
alter table public.class_challenge_recipients enable row level security;
alter table public.challenge_completions enable row level security;

create policy "Users can read their own challenge completions"
  on public.challenge_completions for select
  using (auth.uid() = user_id);

-- No other policies: challenges are read and written through the API only (service role).

-- Each participant's progress on a challenge. Participants are the teacher's actively
-- connected students (only the selected recipients for an 'selected' challenge), so a
-- student who disconnects drops out and one who connects mid-challenge joins. Counted
-- within the challenge's days (Europe/Budapest), from the learner's own activity only
-- (awarded_by is null: teacher bonuses and challenge rewards never count).
--   active_days  distinct days with any finished activity
--   activities   finished activities: any, of one section, or one Vocabulary activity
--                (vocabulary.own_list = own word lists created, with at least one word)
--   xp           XP earned from activities
--   word_list    1 when the student has completed the list by the end of the challenge
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
        else (
          select count(*) from events ev where ev.user_id = p.student_id and ev.section = c.target_activity)
      end)
    end)::int
  from participants p;
end;
$$;

revoke all on function public.challenge_progress(uuid) from public, anon, authenticated;
grant execute on function public.challenge_progress(uuid) to service_role;

-- Challenge badges (Phase 3 engine; metric challenges_completed counts challenge_completions).
insert into public.wisdoms (id, text, text_language, hungarian_equivalent, theme_tags, reviewed) values
  ('many-hands', 'Many hands make light work.', 'en', 'Sok kéz hamar végez.', '{challenge,together}', true),
  ('practice-what-you-preach', 'Practice what you preach.', 'en', 'Tettekkel, ne szavakkal.', '{challenge,effort}', true);

insert into public.badge_definitions
  (key, section, category, criteria_type, params, name_hu, name_en, criteria_hu, criteria_en, icon, hidden, wisdom_id, sort_order)
values
  ('challenge_first', null, 'challenge', 'metric_threshold', '{"metric": "challenges_completed", "min": 1}',
   'Első kihívás', 'First challenge', 'Teljesíts egy kihívást, amelyet a tanárod adott.', 'Complete a challenge set by your teacher.', 'Flag', false, 'many-hands', 510),
  ('challenges_5', null, 'challenge', 'metric_threshold', '{"metric": "challenges_completed", "min": 5}',
   '5 kihívás', '5 challenges', 'Teljesíts 5 kihívást, amelyet a tanárod adott.', 'Complete 5 challenges set by your teacher.', 'Trophy', false, 'practice-what-you-preach', 520);
