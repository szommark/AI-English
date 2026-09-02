-- AI-English: teacher/admin roles + self-serve teacher-student connections

-- Roles
create type public.user_role as enum ('student', 'teacher', 'admin');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid();
$$;

-- Invite codes: one per teacher
create table public.teacher_invite_codes (
  teacher_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  max_uses int not null default 500,
  use_count int not null default 0
);

alter table public.teacher_invite_codes enable row level security;

create policy "Teachers can read their own code"
  on public.teacher_invite_codes for select
  using (auth.uid() = teacher_id);

-- Links
create table public.teacher_student_links (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (teacher_id, student_id)
);

alter table public.teacher_student_links enable row level security;

create policy "Teachers can read their own links"
  on public.teacher_student_links for select
  using (auth.uid() = teacher_id);

create policy "Students can read their own links"
  on public.teacher_student_links for select
  using (auth.uid() = student_id);

create policy "Admins can read all links"
  on public.teacher_student_links for select
  using (public.current_user_role() = 'admin');

-- No insert/update/delete policies for any role. Every write to this table —
-- redemption, disconnect — goes through /api with the service role, so code
-- validation stays atomic and server-side.

-- Failed redemption attempts (admin-visible only)
create table public.connection_attempts (
  id bigint generated always as identity primary key,
  attempted_by uuid not null references auth.users(id) on delete cascade,
  attempted_code text not null,
  reason text not null check (reason in ('not_found', 'expired', 'max_uses_reached', 'self_connect')),
  created_at timestamptz not null default now()
);

alter table public.connection_attempts enable row level security;

create policy "Admins can read connection attempts"
  on public.connection_attempts for select
  using (public.current_user_role() = 'admin');

-- No policy for students/teachers — only the service role writes here, from
-- /api/connect/redeem's catch block, and only admins ever read it.

-- Atomic redemption
create or replace function public.redeem_invite_code(p_code text, p_student_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid;
  v_expires_at timestamptz;
  v_max_uses int;
  v_use_count int;
begin
  select teacher_id, expires_at, max_uses, use_count
  into v_teacher_id, v_expires_at, v_max_uses, v_use_count
  from public.teacher_invite_codes
  where code = p_code
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'code_not_found';
  end if;

  if v_expires_at is not null and v_expires_at < now() then
    raise exception using errcode = 'P0002', message = 'code_expired';
  end if;

  if v_use_count >= v_max_uses then
    raise exception using errcode = 'P0003', message = 'code_max_uses';
  end if;

  if v_teacher_id = p_student_id then
    raise exception using errcode = 'P0004', message = 'self_connect';
  end if;

  update public.teacher_invite_codes
  set use_count = use_count + 1
  where teacher_id = v_teacher_id;

  insert into public.teacher_student_links (teacher_id, student_id, status)
  values (v_teacher_id, p_student_id, 'active')
  on conflict (teacher_id, student_id)
  do update set status = 'active', revoked_at = null;

  return v_teacher_id;
end;
$$;
