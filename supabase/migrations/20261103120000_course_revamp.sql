-- AI-English: mini course revamp (docs/mini-courses-design.md).
-- 1. A new flag reason, "more than one answer fits" (several_fit). "Hard to use / layout" flags are
--    sent to the feedback inbox (feedback_reports), so they are not stored here.
-- 2. A new logged AI call type, course_check: the automatic "only one answer fits" check of new
--    gap items and drafting generator rules from flags (not counted in the daily generation limit).
-- 3. course_gen_rules: rules for the module generator that the AI drafts from repeated confirmed
--    flags; an admin approves them, and approved rules go into every new module's prompt.
-- 4. course-images: one public picture per module (AI-made or the teacher's own).

alter table public.course_item_fixes drop constraint if exists course_item_fixes_reason_check;
alter table public.course_item_fixes add constraint course_item_fixes_reason_check
  check (reason in ('answer_rejected', 'wrong_key', 'faulty_logic', 'several_fit', 'unclear', 'typo', 'other'));

alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps', 'tense_game', 'exam_task_gen', 'comp_test_gen', 'course_gen', 'course_feedback', 'course_fix', 'course_roleplay', 'course_check'));

create table if not exists public.course_gen_rules (
  id uuid primary key default gen_random_uuid(),
  -- The module kind the rule is for; null = every module.
  module_kind text check (module_kind is null or module_kind in ('vocabulary', 'reading', 'listening', 'grammar', 'pronunciation', 'speaking', 'writing', 'unit_check')),
  reason text not null check (reason in ('answer_rejected', 'wrong_key', 'faulty_logic', 'several_fit', 'unclear', 'typo', 'other')),
  rule text not null check (char_length(rule) between 1 and 400),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected')),
  -- How many confirmed flags led to the proposal.
  flag_count integer not null default 0 check (flag_count >= 0),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists course_gen_rules_kind_reason_idx on public.course_gen_rules (module_kind, reason, created_at desc);
create index if not exists course_gen_rules_status_idx on public.course_gen_rules (status, created_at);

alter table public.course_gen_rules enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.

-- Module pictures: public (they are illustrations, nothing personal), written only by the API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-images', 'course-images', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
