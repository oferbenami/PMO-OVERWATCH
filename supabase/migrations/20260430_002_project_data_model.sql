-- Phase 1 - Chapter 4 Project Data Model alignment

create table if not exists managed_architects (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists managed_external_supervisors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists managed_contractors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table projects
  add column if not exists architect_id uuid references managed_architects(id),
  add column if not exists external_pm_supervisor_id uuid references managed_external_supervisors(id),
  add column if not exists last_updated_at timestamptz not null default now(),
  add column if not exists not_updated_this_week boolean not null default false,
  add column if not exists freeze_reason text,
  add column if not exists freeze_note text,
  add column if not exists system_open_date timestamptz not null default now();

create table if not exists project_contractors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  domain text not null check (domain in ('construction_electrical_plumbing','hvac','furniture','branding_signage')),
  contractor_id uuid references managed_contractors(id),
  contractor_name text,
  created_at timestamptz not null default now(),
  unique (project_id, domain)
);

create table if not exists project_warning_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  warning_code text not null,
  warning_message text not null,
  created_at timestamptz not null default now(),
  created_by uuid
);

-- backfill from legacy text fields where possible
insert into managed_architects (full_name)
select distinct architect
from projects
where architect is not null and architect <> ''
on conflict (full_name) do nothing;

insert into managed_external_supervisors (full_name)
select distinct external_pm
from projects
where external_pm is not null and external_pm <> ''
on conflict (full_name) do nothing;

update projects p
set architect_id = ma.id
from managed_architects ma
where p.architect = ma.full_name and p.architect_id is null;

update projects p
set external_pm_supervisor_id = me.id
from managed_external_supervisors me
where p.external_pm = me.full_name and p.external_pm_supervisor_id is null;

-- ensure 6 base topics exist per project
insert into project_topics (project_id, topic_index, topic_name_he, status)
select p.id, t.topic_index, t.topic_name_he, 'on_track'::status_code
from projects p
cross join (
  values
    (1, 'איתור ואישור נכס ופרויקט'),
    (2, 'תכנון'),
    (3, 'מכרזים'),
    (4, 'ביצוע עד אכלוס'),
    (5, 'אישורים ואכלוס'),
    (6, 'אחרי האכלוס')
) as t(topic_index, topic_name_he)
left join project_topics pt
  on pt.project_id = p.id and pt.topic_index = t.topic_index
where pt.id is null;

alter table managed_architects enable row level security;
alter table managed_external_supervisors enable row level security;
alter table managed_contractors enable row level security;
alter table project_contractors enable row level security;
alter table project_warning_events enable row level security;

create policy managed_architects_read on managed_architects for select using (current_user_state() = 'active');
create policy managed_external_supervisors_read on managed_external_supervisors for select using (current_user_state() = 'active');
create policy managed_contractors_read on managed_contractors for select using (current_user_state() = 'active');

create policy project_contractors_read on project_contractors for select using (current_user_state() = 'active');
create policy project_contractors_write on project_contractors for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'));

create policy warning_events_read on project_warning_events for select using (current_user_state() = 'active');
create policy warning_events_write on project_warning_events for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo','project_manager'));
