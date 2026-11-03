-- AI-English: Teacher Toolkit — a public library of lyrics gap-fill activities (same model as the
-- mini courses library, 20261102120000_course_library.sql). A teacher makes one of their own
-- activities public, credited by a name they type ("Shown as"); it is in every teacher's library
-- at once. Other teachers open, print, project or copy it (the copy is their own private
-- activity); only the author edits the original. An admin can hide a public activity, which
-- takes it out of the library; making it private again does the same.
--
-- Reads and writes still go through api/teacher-tools.ts with the service role, so RLS stays on
-- with no policies (as in 20261013120000_teacher_lyrics_activities.sql).

alter table public.teacher_lyrics_activities
  add column if not exists visibility text not null default 'private' check (visibility in ('private', 'public')),
  add column if not exists author_name text not null default '' check (char_length(author_name) <= 80),
  add column if not exists admin_hidden boolean not null default false;

-- The library: public, not hidden activities, newest edit first.
create index if not exists teacher_lyrics_activities_library_idx
  on public.teacher_lyrics_activities (updated_at desc) where visibility = 'public' and not admin_hidden;

alter table public.teacher_lyrics_activities enable row level security;
