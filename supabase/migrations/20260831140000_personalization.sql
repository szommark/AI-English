-- AI-English: personalization tables (learner profile, CEFR history, mistake log,
-- vocabulary mastery). Depends on teacher_student_links from
-- 20260831130000_roles_and_connections.sql (must run after it) for the
-- "connected teachers can read" policies below.

create table public.learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cefr_level text not null default 'B1',
  learner_goal text,
  summary text,
  summary_updated_at timestamptz,
  suggested_topic text,
  created_at timestamptz not null default now()
);

alter table public.learner_profiles enable row level security;

create policy "Users can read their own profile"
  on public.learner_profiles for select
  using (auth.uid() = user_id);

create policy "Connected teachers can read student profiles"
  on public.learner_profiles for select
  using (
    exists (
      select 1 from public.teacher_student_links l
      where l.student_id = learner_profiles.user_id
        and l.teacher_id = auth.uid()
        and l.status = 'active'
    )
  );

create table public.cefr_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cefr_level text not null,
  rationale text,
  created_at timestamptz not null default now()
);

alter table public.cefr_history enable row level security;

create policy "Users can read their own cefr history"
  on public.cefr_history for select
  using (auth.uid() = user_id);

create policy "Connected teachers can read student cefr history"
  on public.cefr_history for select
  using (
    exists (
      select 1 from public.teacher_student_links l
      where l.student_id = cefr_history.user_id
        and l.teacher_id = auth.uid()
        and l.status = 'active'
    )
  );

create table public.mistake_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in
    ('past_tense', 'present_tense', 'prepositions', 'articles', 'word_order', 'vocabulary', 'pronunciation', 'other')),
  example_original text,
  example_corrected text,
  occurrences int not null default 1,
  last_seen_at timestamptz not null default now()
);

alter table public.mistake_log enable row level security;

create policy "Users can read their own mistake log"
  on public.mistake_log for select
  using (auth.uid() = user_id);

create policy "Connected teachers can read student mistake log"
  on public.mistake_log for select
  using (
    exists (
      select 1 from public.teacher_student_links l
      where l.student_id = mistake_log.user_id
        and l.teacher_id = auth.uid()
        and l.status = 'active'
    )
  );

-- Refines the design doc: adds `occurrences`, needed for the new-word /
-- practicing / mastered transition (the design doc's schema omitted this column,
-- which the write logic in api/_lib/personalization.ts needs to count sightings).
create table public.vocabulary_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  status text not null check (status in ('new', 'practicing', 'mastered')),
  occurrences int not null default 1,
  last_seen_at timestamptz not null default now(),
  primary key (user_id, word)
);

alter table public.vocabulary_mastery enable row level security;

create policy "Users can read their own vocabulary"
  on public.vocabulary_mastery for select
  using (auth.uid() = user_id);

create policy "Connected teachers can read student vocabulary"
  on public.vocabulary_mastery for select
  using (
    exists (
      select 1 from public.teacher_student_links l
      where l.student_id = vocabulary_mastery.user_id
        and l.teacher_id = auth.uid()
        and l.status = 'active'
    )
  );

-- No insert/update policies on any of the four tables above — every write
-- is service-role, from api/_lib/personalization.ts.
