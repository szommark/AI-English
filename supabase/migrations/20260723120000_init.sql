-- AI-English: initial schema (Holiday English MVP)

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_id text not null,
  mode text not null check (mode in ('rehearsal', 'test')),
  transcript jsonb not null default '[]'::jsonb,
  feedback jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_created_at_idx
  on public.sessions (user_id, created_at desc);

alter table public.sessions enable row level security;

create policy "Users can read their own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

-- Inserts/updates happen only via the service role from Vercel API routes,
-- so no insert/update policy is granted to regular users.

-- Daily session counter, one row per user per UTC day.
create table if not exists public.daily_session_counts (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

alter table public.daily_session_counts enable row level security;

create policy "Users can read their own daily counts"
  on public.daily_session_counts for select
  using (auth.uid() = user_id);

-- Atomically checks and increments today's session count for a user.
-- Returns the new count if allowed, or raises an exception if the cap is exceeded.
create or replace function public.increment_daily_session_count(p_user_id uuid, p_max int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_count int;
begin
  insert into public.daily_session_counts (user_id, day, count)
  values (p_user_id, v_today, 0)
  on conflict (user_id, day) do nothing;

  select count into v_count
  from public.daily_session_counts
  where user_id = p_user_id and day = v_today
  for update;

  if v_count >= p_max then
    raise exception 'daily_cap_exceeded' using errcode = 'P0001';
  end if;

  update public.daily_session_counts
  set count = count + 1
  where user_id = p_user_id and day = v_today
  returning count into v_count;

  return v_count;
end;
$$;

-- Token usage log for every Groq call, so real consumption can be compared to estimates.
create table if not exists public.groq_usage_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  scenario_id text,
  call_type text not null check (call_type in ('chat', 'feedback')),
  prompt_tokens int,
  completion_tokens int,
  total_tokens int,
  created_at timestamptz not null default now()
);

alter table public.groq_usage_log enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.
