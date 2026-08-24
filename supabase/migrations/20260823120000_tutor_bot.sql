-- AI-English: Tutor Bot mode (scenario-less sessions)

alter table public.sessions alter column scenario_id drop not null;

alter table public.sessions drop constraint if exists sessions_mode_check;
alter table public.sessions add constraint sessions_mode_check
  check (mode in ('rehearsal', 'test', 'tutor'));
