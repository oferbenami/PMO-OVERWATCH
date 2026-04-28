-- PMO-OVERWATCH Phase 1 schema for Supabase
create extension if not exists pgcrypto;

create type app_role as enum ('admin', 'pmo', 'project_manager', 'view_only');
create type user_state as enum ('pending', 'active', 'deactivated');
create type status_code as enum ('on_track', 'at_risk', 'delayed', 'completed', 'frozen', 'not_relevant');

create table if not exists users_profile (
  id uuid primary key,
  email text not null unique,
  full_name text,
  role app_role not null default 'view_only',
  state user_state not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  project_name text not null,
  internal_pm_id uuid references users_profile(id),
  additional_owner_id uuid references users_profile(id),
  expected_asset_receipt_date date not null,
  occupancy_target date not null,
  occupancy_forecast date,
  occupancy_actual date,
  priority text not null check (priority in ('high','medium','low')),
  architect text,
  external_pm text,
  computed_project_status status_code not null default 'on_track',
  requires_management_action boolean not null default false,
  requires_management_action_manual boolean not null default false,
  is_frozen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_topics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  topic_index int not null check (topic_index between 1 and 6),
  topic_name_he text not null,
  target_date date,
  forecast_date date,
  actual_date date,
  status status_code not null default 'on_track',
  unique (project_id, topic_index)
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references project_topics(id) on delete cascade,
  milestone_name_he text not null,
  status status_code not null default 'on_track',
  target_date date,
  forecast_date date,
  actual_date date,
  delay_reason text,
  note text,
  is_key_exception_manual boolean not null default false
);

create table if not exists freeze_periods (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  reason text not null,
  note text,
  start_date date not null,
  end_date date
);

create table if not exists weekly_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  snapshot_date date not null,
  project_status status_code not null,
  occupancy_forecast date,
  key_exception_milestone text,
  requires_management_action boolean not null,
  not_updated_this_week boolean not null,
  unique (project_id, snapshot_date)
);

alter table users_profile enable row level security;
alter table projects enable row level security;
alter table project_topics enable row level security;
alter table milestones enable row level security;
alter table freeze_periods enable row level security;
alter table weekly_snapshots enable row level security;

create or replace function current_app_role()
returns app_role
language sql
stable
as $$
  select role from users_profile where id = auth.uid()
$$;

create or replace function current_user_state()
returns user_state
language sql
stable
as $$
  select state from users_profile where id = auth.uid()
$$;

create policy users_self_read on users_profile for select using (id = auth.uid() or current_app_role() = 'admin');
create policy users_admin_manage on users_profile for all using (current_app_role() = 'admin') with check (current_app_role() = 'admin');

create policy projects_read on projects for select using (current_user_state() = 'active');
create policy projects_write_admin_pmo on projects for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo'));
create policy projects_write_pm on projects for update
using (current_user_state() = 'active' and current_app_role() = 'project_manager' and internal_pm_id = auth.uid())
with check (current_user_state() = 'active' and current_app_role() = 'project_manager' and internal_pm_id = auth.uid());

create policy topics_read on project_topics for select using (current_user_state() = 'active');
create policy topics_write on project_topics for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'));

create policy milestones_read on milestones for select using (current_user_state() = 'active');
create policy milestones_write on milestones for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'));

create policy freeze_read on freeze_periods for select using (current_user_state() = 'active');
create policy freeze_write on freeze_periods for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'));

create policy snapshots_read on weekly_snapshots for select using (current_user_state() = 'active');
create policy snapshots_write_admin_pmo on weekly_snapshots for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo'));
