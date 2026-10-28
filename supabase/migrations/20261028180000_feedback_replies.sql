-- Avalon: users follow their own problem reports (Report a problem, phase 3).
--
-- Admins can write a reply the reporter sees (admin_note stays private). When a report is
-- marked fixed or won't-fix, or gets a reply, user_update_at moves; the reporter sees a
-- one-time notice until user_seen_at catches up (opening /my-reports or dismissing it).
-- Still service-role only: /api/connect?action=my-feedback… and /api/admin/overview.

alter table public.feedback_reports
  add column admin_reply text check (admin_reply is null or char_length(admin_reply) <= 2000),
  add column replied_at timestamptz,
  add column user_update_at timestamptz,
  add column user_seen_at timestamptz;

-- The once-per-visit "anything new for me?" check.
create index feedback_reports_user_update_idx on public.feedback_reports (user_id, user_update_at desc)
  where user_update_at is not null;
