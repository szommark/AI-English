-- AI-English: mini courses, the author's preview flags (docs/mini-courses-design.md).
-- While previewing their own module a teacher flags items (reason + note); the flags wait on the
-- module until "Fix flagged items" sends just those items to the AI. Written only by the API
-- (api/_lib/courses.ts), like the rest of course_modules.

alter table public.course_modules
  add column if not exists preview_flags jsonb not null default '[]'::jsonb;

alter table public.course_modules drop constraint if exists course_modules_preview_flags_check;
alter table public.course_modules add constraint course_modules_preview_flags_check
  check (jsonb_typeof(preview_flags) = 'array');
