-- AI-English: hybrid pronunciation feedback (rehearsal screen)
-- Daily/monthly Azure Deep Check caps, reserved at token-issuance time so a
-- client can never spend Azure minutes without them being counted (see
-- reserve_deep_check below).

create table if not exists public.daily_deep_check_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  utc_date date not null,
  count int not null default 0,
  primary key (user_id, utc_date)
);

alter table public.daily_deep_check_usage enable row level security;

create policy "Users can read their own deep check usage"
  on public.daily_deep_check_usage for select
  using (auth.uid() = user_id);

-- Inserts/updates happen only via the service role from Vercel API routes,
-- so no insert/update policy is granted to regular users.

-- App-wide monthly Azure usage, one row per UTC month. Never exposed to
-- client reads at all (mirrors groq_usage_log) since it's not per-user data.
create table if not exists public.azure_usage_monthly (
  utc_month text primary key,
  total_seconds int not null default 0
);

alter table public.azure_usage_monthly enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.

create table if not exists public.pronunciation_checks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_id text not null,
  target_sentence text not null,
  azure_result jsonb not null,
  audio_seconds numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists pronunciation_checks_user_id_created_at_idx
  on public.pronunciation_checks (user_id, created_at desc);

alter table public.pronunciation_checks enable row level security;

create policy "Users can read their own pronunciation checks"
  on public.pronunciation_checks for select
  using (auth.uid() = user_id);

-- Atomically reserves one daily deep-check slot and p_reserve_seconds against
-- the monthly cap for a user, BEFORE a token is ever issued. Raises
-- 'daily_cap_exceeded' or 'monthly_cap_exceeded' if either limit would be hit,
-- and neither counter is touched if it raises. This is what guarantees a
-- client can't bypass the caps by skipping the post-check log call.
create or replace function public.reserve_deep_check(
  p_user_id uuid,
  p_daily_max int,
  p_reserve_seconds int,
  p_monthly_cap int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_daily_count int;
  v_monthly_seconds int;
begin
  insert into public.daily_deep_check_usage (user_id, utc_date, count)
  values (p_user_id, v_today, 0)
  on conflict (user_id, utc_date) do nothing;

  insert into public.azure_usage_monthly (utc_month, total_seconds)
  values (v_month, 0)
  on conflict (utc_month) do nothing;

  select count into v_daily_count
  from public.daily_deep_check_usage
  where user_id = p_user_id and utc_date = v_today
  for update;

  if v_daily_count >= p_daily_max then
    raise exception 'daily_cap_exceeded' using errcode = 'P0001';
  end if;

  select total_seconds into v_monthly_seconds
  from public.azure_usage_monthly
  where utc_month = v_month
  for update;

  if v_monthly_seconds + p_reserve_seconds > p_monthly_cap then
    raise exception 'monthly_cap_exceeded' using errcode = 'P0001';
  end if;

  update public.daily_deep_check_usage
  set count = count + 1
  where user_id = p_user_id and utc_date = v_today;

  update public.azure_usage_monthly
  set total_seconds = total_seconds + p_reserve_seconds
  where utc_month = v_month;
end;
$$;

-- Releases a reservation made by reserve_deep_check, used when Azure's token
-- endpoint fails after the reservation succeeded, so a transient outage
-- doesn't burn a user's quota for nothing.
create or replace function public.release_deep_check_reservation(
  p_user_id uuid,
  p_reserve_seconds int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
begin
  update public.daily_deep_check_usage
  set count = greatest(count - 1, 0)
  where user_id = p_user_id and utc_date = v_today;

  update public.azure_usage_monthly
  set total_seconds = greatest(total_seconds - p_reserve_seconds, 0)
  where utc_month = v_month;
end;
$$;

-- Trues the current month's reserved seconds down to the actual clip length
-- once /api/pronunciation-log reports it. p_delta is expected to be <= 0
-- (actual_seconds - the seconds originally reserved).
create or replace function public.true_up_deep_check_seconds(p_delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
begin
  update public.azure_usage_monthly
  set total_seconds = greatest(total_seconds + p_delta, 0)
  where utc_month = v_month;
end;
$$;
