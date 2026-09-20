-- Latest rate-limit headers seen from a provider (Groq), so the admin usage page can show the
-- live organisation-wide allowance instead of only this app's own usage.
create table if not exists public.provider_rate_limit_snapshot (
  provider text primary key,
  limit_requests int, remaining_requests int,
  limit_tokens int, remaining_tokens int,
  seen_at timestamptz not null default now()
);
alter table public.provider_rate_limit_snapshot enable row level security;
-- No public policies: service role only.
