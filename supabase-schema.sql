-- ═══════════════════════════════════════════════
-- ProcesoAlert / ProcesoCat — Full Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. ROLES ENUM & TABLE
create type public.app_role as enum ('admin', 'moderator', 'user', 'municipi');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Security definer to check roles without recursion
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 2. PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  avatar_url text,
  banner_color text default '#2D6A4F',
  banner_image text,
  language text default 'es',
  plan text default 'free',
  points integer default 0,
  weekly_points integer default 0,
  rank text default 'Explorador',
  pet_name text,
  pet_type text,
  referral_code text,
  municipality_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    upper(substring(md5(new.id::text) from 1 for 6))
  );
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. REPORTS
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  lat double precision not null,
  lng double precision not null,
  description text not null default '',
  status text not null default 'ACTIVE',
  danger_score integer default 50,
  validation_count integer default 0,
  photos text[] default '{}',
  comarca text,
  alert_type text not null default 'procesionaria',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_activity_at timestamptz default now()
);
alter table public.reports enable row level security;

create policy "Reports are viewable by everyone"
  on public.reports for select
  to authenticated
  using (true);

create policy "Authenticated users can create reports"
  on public.reports for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own reports"
  on public.reports for update
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can update any report"
  on public.reports for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 4. REPORT VALIDATIONS
create table public.report_validations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  trust_score double precision not null default 1.0,
  distance_meters double precision not null,
  validation_type text not null default 'remote',
  gps_accuracy double precision,
  created_at timestamptz default now(),
  unique (report_id, user_id)
);
alter table public.report_validations enable row level security;

create policy "Validations are viewable by everyone"
  on public.report_validations for select
  to authenticated
  using (true);

create policy "Users can create validations"
  on public.report_validations for insert
  to authenticated
  with check (user_id = auth.uid());

-- Auto-increment validation_count on reports
create or replace function public.handle_new_validation()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.reports
  set validation_count = validation_count + 1,
      last_activity_at = now(),
      updated_at = now()
  where id = new.report_id;
  return new;
end;
$$;

create trigger on_validation_created
  after insert on public.report_validations
  for each row execute function public.handle_new_validation();

-- 5. NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title_es text not null default '',
  title_ca text not null default '',
  body_es text not null default '',
  body_ca text not null default '',
  read boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

-- 6. SAVED ZONES
create table public.saved_zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  radius_km double precision default 2,
  alert_threshold integer default 40,
  current_danger_score integer default 0,
  created_at timestamptz default now()
);
alter table public.saved_zones enable row level security;

create policy "Users can manage own zones"
  on public.saved_zones for all
  to authenticated
  using (user_id = auth.uid());

-- 7. USER BADGES
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_id text not null,
  earned_at timestamptz default now(),
  progress integer default 0,
  total integer default 1,
  unique (user_id, badge_id)
);
alter table public.user_badges enable row level security;

create policy "Badges are viewable by everyone"
  on public.user_badges for select
  to authenticated
  using (true);

create policy "Users can manage own badges"
  on public.user_badges for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own badges"
  on public.user_badges for update
  to authenticated
  using (user_id = auth.uid());

-- 8. Updated_at trigger helper
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger reports_updated_at before update on public.reports
  for each row execute function public.update_updated_at();
