-- Avalon: "Report a problem" — bug, glitch, wrong-content and idea reports from signed-in users.
--
-- The floating report button posts to /api/connect?action=feedback, which validates the report,
-- rate-limits it, stores an optional screenshot in the private feedback-shots bucket and inserts
-- the row with the service role. Admins triage everything on /admin/feedback through
-- /api/admin/overview?resource=feedback. Browsers never touch the table directly.

create table public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Role at the time of the report, so teacher reports stay tagged even if the role changes.
  user_role text not null check (user_role in ('student', 'teacher', 'admin')),
  kind text not null check (kind in ('bug', 'display', 'content', 'idea')),
  description text not null check (char_length(description) between 1 and 4000),
  expected text check (expected is null or char_length(expected) <= 2000),
  page_path text not null check (char_length(page_path) <= 500),
  -- Browser, OS, viewport, UI language, app version, mic permission, recent console errors
  -- and failed requests (src/lib/feedbackContext.ts).
  context jsonb not null default '{}'::jsonb,
  screenshot_path text,
  status text not null default 'new'
    check (status in ('new', 'seen', 'in_progress', 'fixed', 'wont_fix')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 4000),
  status_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feedback_reports_status_idx on public.feedback_reports (status, created_at desc);
create index feedback_reports_user_idx on public.feedback_reports (user_id, created_at desc);

alter table public.feedback_reports enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.

-- Screenshots attached to reports. Private; the admin inbox hands out short signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback-shots', 'feedback-shots', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
