-- AI-English: gamification Phase 3 — badges and wisdom cards (docs/gamification-design.md
-- §6, §9). Badges are data rows evaluated by a generic engine (api/_lib/badges.ts); each
-- badge carries one fixed proverb (a "wisdom") shown on the badge wall and in the earn
-- toast, never for locked or hidden badges.
--
-- Nothing here is readable straight from the browser except the learner's own earned
-- badges: definitions and wisdoms are served through /api/gamification, which hides the
-- proverb of a badge that isn't earned yet and everything about a hidden one.

create table public.wisdoms (
  id text primary key,
  -- The proverb in its own language.
  text text not null,
  text_language text not null default 'en' check (text_language in ('en', 'de')),
  -- The real Hungarian saying where one exists, not a word-for-word translation.
  hungarian_equivalent text not null,
  theme_tags text[] not null default '{}',
  -- Only reviewed, enabled wisdoms are ever shown.
  reviewed boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.wisdoms enable row level security;
-- No policies: read through the API only (service role).

create table public.badge_definitions (
  key text primary key,
  -- features.ts id for grouping on the badge wall; null for cross-section badges.
  section text,
  category text not null check (category in (
    'milestone', 'mastery', 'consistency', 'conversation', 'vocabulary', 'exam', 'hidden', 'challenge'
  )),
  -- How api/_lib/badges.ts evaluates it; params hold the thresholds.
  --   event_count       { activity_types?: text[], count }  learner XP events (any type when absent)
  --   metric_threshold  { metric, min }  level | best_week_streak | words_mastered |
  --                                      teacher_lists_completed | sounds_mastered
  --   persona_sessions  { count }  template: one badge per enabled persona (key '<key>:<persona id>')
  --   distinct_count    { source: 'personas', target: 'all_enabled' }
  --   cefr_level_up     {}  any CEFR estimate above the learner's first one
  --   custom            { handler, ... }  welcome_back { days }
  criteria_type text not null check (criteria_type in (
    'event_count', 'metric_threshold', 'persona_sessions', 'distinct_count', 'cefr_level_up', 'custom'
  )),
  params jsonb not null default '{}',
  -- {persona} is replaced with the persona's name for persona_sessions templates.
  name_hu text not null,
  name_en text not null,
  criteria_hu text not null,
  criteria_en text not null,
  -- lucide-react icon name; must be in BADGE_ICONS (src/components/gamification/badgeIcons.ts).
  icon text not null,
  -- Shown as "?" until earned.
  hidden boolean not null default false,
  wisdom_id text references public.wisdoms (id),
  sort_order int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.badge_definitions enable row level security;
-- No policies: read through the API only (service role).

create table public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- badge_definitions.key, or '<template key>:<persona id>' for per-persona badges (so no FK).
  badge_key text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_key)
);

alter table public.user_badges enable row level security;

create policy "Users can read their own badges"
  on public.user_badges for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies: badges are granted by api/_lib/badges.ts (service role).
-- A badge, once earned, is never taken back.

-- XP per section for the "Az én fejlődésem" panel.
create or replace function public.gamification_xp_by_section(p_user_id uuid)
returns table (section text, xp int)
language sql
stable
security definer
set search_path = public
as $$
  select t.section, sum(e.base_xp + e.bonus_xp)::int
  from public.xp_events e
  join public.gamification_activity_types t on t.key = e.activity_type
  where e.user_id = p_user_id
  group by t.section
  having sum(e.base_xp + e.bonus_xp) > 0
  order by 2 desc;
$$;

-- The learner's own finished activities per activity type (awarded_by is null: teacher
-- bonuses don't count), for event_count badges.
create or replace function public.gamification_event_counts(p_user_id uuid)
returns table (activity_type text, events int)
language sql
stable
security definer
set search_path = public
as $$
  select e.activity_type, count(*)::int
  from public.xp_events e
  where e.user_id = p_user_id and e.awarded_by is null
  group by e.activity_type;
$$;

revoke all on function public.gamification_xp_by_section(uuid) from public, anon, authenticated;
grant execute on function public.gamification_xp_by_section(uuid) to service_role;
revoke all on function public.gamification_event_counts(uuid) from public, anon, authenticated;
grant execute on function public.gamification_event_counts(uuid) to service_role;

-- Starter wisdoms. Seeded as reviewed: Mark reviews the pairings in the PR (design §6.3).
insert into public.wisdoms (id, text, text_language, hungarian_equivalent, theme_tags, reviewed) values
  ('well-begun', 'Well begun is half done.', 'en', 'Jó kezdet fél siker.', '{start}', true),
  ('slow-and-steady', 'Slow and steady wins the race.', 'en', 'Lassan járj, tovább érsz.', '{progress}', true),
  ('no-pain-no-gain', 'No pain, no gain.', 'en', 'Munka nélkül nincs kalács.', '{effort}', true),
  ('sow-reap', 'As you sow, so shall you reap.', 'en', 'Ki mint vet, úgy arat.', '{progress,effort}', true),
  ('rome', 'Rome wasn''t built in a day.', 'en', 'Nem egy nap alatt épült Róma.', '{consistency}', true),
  ('constant-dripping', 'Constant dripping wears away the stone.', 'en', 'Lassú víz partot mos.', '{consistency}', true),
  ('patience', 'Patience is a virtue.', 'en', 'A türelem rózsát terem.', '{consistency}', true),
  ('nothing-ventured', 'Nothing ventured, nothing gained.', 'en', 'Aki mer, az nyer.', '{start,courage}', true),
  ('two-heads', 'Two heads are better than one.', 'en', 'Több szem többet lát.', '{conversation}', true),
  ('friend-in-need', 'A friend in need is a friend indeed.', 'en', 'Bajban ismerni meg a barátot.', '{conversation}', true),
  ('variety', 'Variety is the spice of life.', 'en', 'A változatosság gyönyörködtet.', '{conversation,explore}', true),
  ('when-in-rome', 'When in Rome, do as the Romans do.', 'en', 'Ahány ház, annyi szokás.', '{conversation,explore}', true),
  ('live-and-learn', 'Live and learn.', 'en', 'Tanul az ember, amíg él.', '{learning}', true),
  ('practice-perfect', 'Practice makes perfect.', 'en', 'Gyakorlat teszi a mestert.', '{mastery}', true),
  ('where-there-is-a-will', 'Where there''s a will, there''s a way.', 'en', 'Ahol akarat van, ott út is van.', '{mastery,effort}', true),
  ('every-little-helps', 'Every little helps.', 'en', 'Sok kicsi sokra megy.', '{vocabulary,progress}', true),
  ('knowledge-power', 'Knowledge is power.', 'en', 'A tudás hatalom.', '{vocabulary}', true),
  ('word-to-the-wise', 'A word to the wise is enough.', 'en', 'Okos embernek fél szó is elég.', '{vocabulary,teacher}', true),
  ('better-late', 'Better late than never.', 'en', 'Jobb későn, mint soha.', '{return}', true);

-- Starter catalogue (19 badges; persona_sessions is one template row that becomes a badge
-- per enabled persona). Exam and grammar-mastery badges wait until that data is stored.
insert into public.badge_definitions
  (key, section, category, criteria_type, params, name_hu, name_en, criteria_hu, criteria_en, icon, hidden, wisdom_id, sort_order)
values
  ('first_steps', null, 'milestone', 'event_count', '{"count": 1}',
   'Az első lépés', 'First steps', 'Fejezz be egy gyakorlatot.', 'Finish any activity.', 'Footprints', false, 'well-begun', 10),
  ('level_5', null, 'milestone', 'metric_threshold', '{"metric": "level", "min": 5}',
   '5. szint', 'Level 5', 'Érd el az 5. szintet.', 'Reach level 5.', 'TrendingUp', false, 'slow-and-steady', 20),
  ('level_10', null, 'milestone', 'metric_threshold', '{"metric": "level", "min": 10}',
   '10. szint', 'Level 10', 'Érd el a 10. szintet.', 'Reach level 10.', 'Mountain', false, 'no-pain-no-gain', 30),
  ('cefr_up', null, 'milestone', 'cefr_level_up', '{}',
   'Szintlépés a nyelvtudásban', 'Language level up', 'Lépj feljebb egy CEFR-szintet a becslés szerint.', 'Move up a CEFR level in your estimate.', 'GraduationCap', false, 'sow-reap', 40),

  ('weeks_4', null, 'consistency', 'metric_threshold', '{"metric": "best_week_streak", "min": 4}',
   '4 hét egymás után', '4 weeks in a row', 'Teljesítsd a heti célodat 4 egymást követő héten.', 'Meet your weekly goal 4 weeks in a row.', 'CalendarCheck', false, 'rome', 110),
  ('weeks_12', null, 'consistency', 'metric_threshold', '{"metric": "best_week_streak", "min": 12}',
   '12 hét egymás után', '12 weeks in a row', 'Teljesítsd a heti célodat 12 egymást követő héten.', 'Meet your weekly goal 12 weeks in a row.', 'CalendarCheck', false, 'constant-dripping', 120),
  ('weeks_26', null, 'consistency', 'metric_threshold', '{"metric": "best_week_streak", "min": 26}',
   'Fél év kitartás', 'Half a year of practice', 'Teljesítsd a heti célodat 26 egymást követő héten.', 'Meet your weekly goal 26 weeks in a row.', 'CalendarCheck', false, 'patience', 130),

  ('tutor_first', 'tutor-bot', 'conversation', 'event_count', '{"activity_types": ["tutor-bot.conversation"], "count": 1}',
   'Első beszélgetés', 'First conversation', 'Beszélgess legalább 6 fordulót az Oktató bottal.', 'Have a conversation of at least 6 turns with the Tutor Bot.', 'MessageCircle', false, 'nothing-ventured', 210),
  ('tutor_10', 'tutor-bot', 'conversation', 'event_count', '{"activity_types": ["tutor-bot.conversation"], "count": 10}',
   '10 beszélgetés', '10 conversations', 'Folytass 10 beszélgetést az Oktató bottal.', 'Have 10 conversations with the Tutor Bot.', 'MessagesSquare', false, 'two-heads', 220),
  ('tutor_persona', 'tutor-bot', 'conversation', 'persona_sessions', '{"count": 5}',
   'Beszélgetőtárs: {persona}', 'Conversation partner: {persona}', '5 beszélgetés ezzel a szereplővel: {persona}.', '5 conversations with {persona}.', 'UserRound', false, 'friend-in-need', 230),
  ('explorer', 'tutor-bot', 'conversation', 'distinct_count', '{"source": "personas", "target": "all_enabled"}',
   'Felfedező', 'Explorer', 'Beszélgess az Oktató bot minden elérhető szereplőjével.', 'Talk with every available Tutor Bot persona.', 'Compass', false, 'variety', 240),
  ('scenario_first', 'conversational-english', 'conversation', 'event_count',
   '{"activity_types": ["conversational-english.scenario_live", "conversational-english.rehearsal"], "count": 1}',
   'Első élethelyzet', 'First scenario', 'Fejezz be egy beszélgetést a Társalgási angol részben.', 'Finish a conversation in Conversational English.', 'Map', false, 'when-in-rome', 250),
  ('scenarios_10', 'conversational-english', 'conversation', 'event_count',
   '{"activity_types": ["conversational-english.scenario_live", "conversational-english.rehearsal"], "count": 10}',
   '10 élethelyzet', '10 scenarios', 'Fejezz be 10 beszélgetést a Társalgási angol részben.', 'Finish 10 conversations in Conversational English.', 'Plane', false, 'live-and-learn', 260),

  ('sound_mastered', 'pronunciation-session', 'mastery', 'metric_threshold', '{"metric": "sounds_mastered", "min": 1}',
   'Első hang', 'First sound mastered', 'Érj el legalább 80%-ot hallásban és kiejtésben is egy hangnál.', 'Score at least 80% for both hearing and saying one sound.', 'Mic', false, 'practice-perfect', 310),
  ('sounds_5', 'pronunciation-session', 'mastery', 'metric_threshold', '{"metric": "sounds_mastered", "min": 5}',
   '5 hang', '5 sounds mastered', 'Érj el legalább 80%-ot hallásban és kiejtésben is 5 hangnál.', 'Score at least 80% for both hearing and saying five sounds.', 'AudioLines', false, 'where-there-is-a-will', 320),

  ('words_100', 'vocabulary', 'vocabulary', 'metric_threshold', '{"metric": "words_mastered", "min": 100}',
   '100 szó', '100 words', 'Sajátíts el 100 szót a Szótanulóban.', 'Master 100 words in Vocabulary.', 'BookOpen', false, 'every-little-helps', 410),
  ('words_500', 'vocabulary', 'vocabulary', 'metric_threshold', '{"metric": "words_mastered", "min": 500}',
   '500 szó', '500 words', 'Sajátíts el 500 szót a Szótanulóban.', 'Master 500 words in Vocabulary.', 'Library', false, 'knowledge-power', 420),
  ('list_first', 'vocabulary', 'vocabulary', 'metric_threshold', '{"metric": "teacher_lists_completed", "min": 1}',
   'Első tanári szólista', 'First teacher list', 'Tanuld meg a tanárod egyik szólistájának minden szavát.', 'Learn every word on one of your teacher''s lists.', 'ListChecks', false, 'word-to-the-wise', 430),

  ('welcome_back', null, 'hidden', 'custom', '{"handler": "welcome_back", "days": 30}',
   'Újra itt', 'Welcome back', 'Gyakorolj újra legalább 30 nap szünet után.', 'Practise again after a break of 30 days or more.', 'Sunrise', true, 'better-late', 900);
