-- AI-English: mini courses Phase 3 — the public library and self-enroll (docs/mini-courses-design.md).
-- The visibility / admin_hidden / self_enroll columns already exist (20261029120000_courses.sql);
-- this adds the name a teacher is credited by on a public course, and an index for the library.

alter table public.courses
  add column if not exists author_name text not null default '' check (char_length(author_name) <= 80);

-- The library and the student shelf read public, published courses.
create index if not exists courses_library_idx on public.courses (level, updated_at desc) where visibility = 'public' and status = 'published';

-- A teacher's own assignments of a course (library courses are assigned by many teachers).
create index if not exists course_enrollments_assigned_by_idx on public.course_enrollments (assigned_by, course_id) where assigned_by is not null;
