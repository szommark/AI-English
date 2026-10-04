-- AI-English: gamification Phase 5 — class comparison and the public leaderboard
-- (docs/gamification-design.md §8). Ships SWITCHED OFF: both admin switches below start
-- false, and nothing is shown to learners until an admin turns them on — the opt-in wording
-- and the under-16 handling are to be checked legally first (design §8.3).
--
--   class comparison    a teacher turns it on for their class (all actively connected
--                       students); those students see a weekly XP ranking of the class.
--                       Classmates appear by leaderboard nickname, or as "Osztálytárs N".
--   public leaderboard  learners opt in with a nickname and an "I am 16 or older"
--                       self-declaration (only the confirmation time is stored, no birth
--                       date); weekly ranking in three CEFR leagues; leaving is instant and
--                       clears the nickname. A teacher can disallow it for their class: a
--                       student with any such teacher can't join and isn't listed.
-- Rankings count only XP from the learner's own practice this week (Mon–Sun, Budapest):
-- teacher bonuses and challenge rewards (awarded_by set) never count.

-- Admin switches (the kill switch). Read and written through /api/gamification only.
create table public.gamification_settings (
  key text primary key check (key in ('public_leaderboard', 'class_comparison')),
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.gamification_settings (key, enabled) values
  ('public_leaderboard', false),
  ('class_comparison', false);

alter table public.gamification_settings enable row level security;
-- No policies: service role only.

-- A teacher's settings for their class.
create table public.teacher_gamification_settings (
  teacher_id uuid primary key references auth.users (id) on delete cascade,
  class_comparison boolean not null default false,
  leaderboard_allowed boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.teacher_gamification_settings enable row level security;
-- No policies: service role only.

-- The learner's public leaderboard membership (design §9: leaderboard_opt_in, nickname,
-- opt_in_at, age_16_confirmed_at).
alter table public.learner_gamification
  add column leaderboard_opt_in boolean not null default false,
  add column nickname text check (nickname is null or char_length(nickname) between 3 and 20),
  add column opt_in_at timestamptz,
  add column age_16_confirmed_at timestamptz,
  add constraint learner_gamification_opt_in_needs_nickname
    check (not leaderboard_opt_in or (nickname is not null and age_16_confirmed_at is not null));

create unique index learner_gamification_nickname_idx on public.learner_gamification (lower(nickname))
  where nickname is not null;

-- Monday 00:00 Europe/Budapest of the current week, as a timestamp with time zone.
-- KEEP IN SYNC with GAMIFICATION_TIMEZONE (src/lib/gamification/constants.ts).
create or replace function public.gamification_week_start()
returns timestamptz
language sql
stable
set search_path = public
as $$
  select date_trunc('week', now() at time zone 'Europe/Budapest') at time zone 'Europe/Budapest';
$$;

-- Everyone on the public leaderboard this week: opted in, not under a teacher who
-- disallows it, with this week's practice XP and their latest CEFR estimate (the API puts
-- them in leagues and ranks them).
create or replace function public.public_leaderboard_week()
returns table (user_id uuid, nickname text, level int, xp int, cefr_level text)
language sql
stable
security definer
set search_path = public
as $$
  select
    g.user_id,
    g.nickname,
    g.level,
    coalesce((
      select sum(e.base_xp + e.bonus_xp)::int from public.xp_events e
      where e.user_id = g.user_id and e.awarded_by is null
        and e.created_at >= public.gamification_week_start()
    ), 0),
    (select h.cefr_level from public.cefr_history h where h.user_id = g.user_id order by h.created_at desc limit 1)
  from public.learner_gamification g
  where g.leaderboard_opt_in and g.nickname is not null
    and not exists (
      select 1 from public.teacher_student_links l
      join public.teacher_gamification_settings s on s.teacher_id = l.teacher_id
      where l.student_id = g.user_id and l.status = 'active' and not s.leaderboard_allowed
    );
$$;

-- A teacher's class this week: every actively connected student with this week's practice
-- XP and their nickname (only while they are on the public leaderboard).
create or replace function public.class_ranking_week(p_teacher_id uuid)
returns table (student_id uuid, nickname text, xp int)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.student_id,
    case when g.leaderboard_opt_in then g.nickname end,
    coalesce((
      select sum(e.base_xp + e.bonus_xp)::int from public.xp_events e
      where e.user_id = l.student_id and e.awarded_by is null
        and e.created_at >= public.gamification_week_start()
    ), 0)
  from public.teacher_student_links l
  left join public.learner_gamification g on g.user_id = l.student_id
  where l.teacher_id = p_teacher_id and l.status = 'active';
$$;

-- All called only from api/gamification.ts via supabaseAdmin.
revoke all on function public.public_leaderboard_week() from public, anon, authenticated;
grant execute on function public.public_leaderboard_week() to service_role;
revoke all on function public.class_ranking_week(uuid) from public, anon, authenticated;
grant execute on function public.class_ranking_week(uuid) to service_role;
