-- AI-English: Pronunciation Centre revamp — remove the per-user daily deep-check
-- cap. The monthly app-wide cap (azure_usage_monthly) remains the only quota
-- enforcement, protecting the shared Azure free tier across all users combined.

drop function if exists public.reserve_deep_check(uuid, int, int, int);
drop function if exists public.release_deep_check_reservation(uuid, int);
drop table if exists public.daily_deep_check_usage;

-- Atomically reserves p_reserve_seconds against the monthly cap, BEFORE a token
-- is ever issued. Raises 'monthly_cap_exceeded' if it would be exceeded, and
-- the counter isn't touched if it raises — this is what guarantees a client
-- can't bypass the cap by skipping the post-check log call.
create or replace function public.reserve_deep_check(p_reserve_seconds int, p_monthly_cap int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_monthly_seconds int;
begin
  insert into public.azure_usage_monthly (utc_month, total_seconds)
  values (v_month, 0)
  on conflict (utc_month) do nothing;

  select total_seconds into v_monthly_seconds
  from public.azure_usage_monthly
  where utc_month = v_month
  for update;

  if v_monthly_seconds + p_reserve_seconds > p_monthly_cap then
    raise exception 'monthly_cap_exceeded' using errcode = 'P0001';
  end if;

  update public.azure_usage_monthly
  set total_seconds = total_seconds + p_reserve_seconds
  where utc_month = v_month;
end;
$$;

-- Releases a reservation made by reserve_deep_check, used when Azure's token
-- endpoint fails after the reservation succeeded, so a transient outage
-- doesn't burn quota for nothing.
create or replace function public.release_deep_check_reservation(p_reserve_seconds int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
begin
  update public.azure_usage_monthly
  set total_seconds = greatest(total_seconds - p_reserve_seconds, 0)
  where utc_month = v_month;
end;
$$;
