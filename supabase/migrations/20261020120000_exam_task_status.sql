-- AVaLoN: exam task maker, "Publish for review" gate. A task starts as a draft; the creator
-- publishes it, and only a published task can be sent to testers. Any content change (a new
-- revision) puts it back to draft until the creator publishes again.
-- Shapes: src/lib/examTasks.ts; logic: api/_lib/examTasks.ts.

alter table public.exam_tasks
  add column if not exists status text not null default 'draft',
  -- The revision that was published last, and when.
  add column if not exists published_revision int,
  add column if not exists published_at timestamptz;

alter table public.exam_tasks drop constraint if exists exam_tasks_status_check;
alter table public.exam_tasks add constraint exam_tasks_status_check
  check (status in ('draft', 'published'));

-- Tasks already sent to testers count as published at their current revision.
update public.exam_tasks t
set status = 'published',
    published_revision = t.revision,
    published_at = coalesce(t.published_at, now())
where t.status = 'draft'
  and t.published_revision is null
  and exists (select 1 from public.exam_task_reviewers r where r.task_id = t.id);
