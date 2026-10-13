-- AI-English: teacher control of the Grammar Coach Tense Explorer (docs/tense-explorer-design.md,
-- "Teacher settings"). A teacher picks which of the 13 explorer tenses their students see and
-- whether students may change that set. One class-wide row per teacher (student_id null) plus
-- optional per-student overrides. Read and written only by api/teacher-tools.ts (teacher) and
-- api/grammar-lesson.ts (the student's resolved policy).

create table if not exists public.tense_explorer_settings (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references auth.users (id) on delete cascade,
  student_id uuid references auth.users (id) on delete cascade,
  -- KEEP IN SYNC with TENSE_IDS (src/lib/tenseEngine/types.ts).
  tenses text[] not null check (
    cardinality(tenses) between 1 and 13
    and tenses <@ array[
      'present-simple', 'present-continuous', 'present-perfect', 'present-perfect-continuous',
      'past-simple', 'past-continuous', 'past-perfect', 'past-perfect-continuous',
      'future-simple', 'future-continuous', 'future-perfect', 'future-perfect-continuous',
      'be-going-to'
    ]::text[]
  ),
  allow_customize boolean not null default true,
  updated_at timestamptz not null default now()
);

-- One class setting per teacher, one override per teacher and student.
create unique index if not exists tense_explorer_settings_class_idx
  on public.tense_explorer_settings (teacher_id) where student_id is null;
create unique index if not exists tense_explorer_settings_student_idx
  on public.tense_explorer_settings (teacher_id, student_id) where student_id is not null;
create index if not exists tense_explorer_settings_student_lookup_idx
  on public.tense_explorer_settings (student_id) where student_id is not null;

alter table public.tense_explorer_settings enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.
