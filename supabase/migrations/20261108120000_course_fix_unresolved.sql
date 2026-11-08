-- A student's flag the AI said was wrong, but whose fix changed nothing the learner can see
-- (e.g. only a comma in an order step's alternatives): logged as 'unresolved' so the teacher
-- sees it needs a look, instead of 'fixed' or 'kept'.

alter table public.course_item_fixes drop constraint if exists course_item_fixes_status_check;
alter table public.course_item_fixes add constraint course_item_fixes_status_check
  check (status in ('fixed', 'kept', 'undone', 'unresolved'));
