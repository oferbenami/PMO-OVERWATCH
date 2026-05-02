-- Chapter: Managed lists full implementation

alter table managed_architects
  add column if not exists code text,
  add column if not exists label_he text,
  add column if not exists label_en text,
  add column if not exists sort_order integer not null default 1000,
  add column if not exists updated_at timestamptz not null default now();

alter table managed_external_supervisors
  add column if not exists code text,
  add column if not exists label_he text,
  add column if not exists label_en text,
  add column if not exists sort_order integer not null default 1000,
  add column if not exists updated_at timestamptz not null default now();

alter table managed_contractors
  add column if not exists code text,
  add column if not exists label_he text,
  add column if not exists label_en text,
  add column if not exists sort_order integer not null default 1000,
  add column if not exists updated_at timestamptz not null default now();

update managed_architects set label_he = coalesce(label_he, full_name), code = coalesce(code, 'architect_' || substr(id::text, 1, 8));
update managed_external_supervisors set label_he = coalesce(label_he, full_name), code = coalesce(code, 'supervisor_' || substr(id::text, 1, 8));
update managed_contractors set label_he = coalesce(label_he, full_name), code = coalesce(code, 'contractor_' || substr(id::text, 1, 8));

alter table managed_architects alter column code set not null;
alter table managed_architects alter column label_he set not null;
alter table managed_external_supervisors alter column code set not null;
alter table managed_external_supervisors alter column label_he set not null;
alter table managed_contractors alter column code set not null;
alter table managed_contractors alter column label_he set not null;

create unique index if not exists managed_architects_code_key on managed_architects(code);
create unique index if not exists managed_external_supervisors_code_key on managed_external_supervisors(code);
create unique index if not exists managed_contractors_code_key on managed_contractors(code);

create table if not exists managed_planners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_he text not null,
  label_en text,
  sort_order integer not null default 1000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists managed_delay_reasons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_he text not null,
  label_en text,
  sort_order integer not null default 1000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists managed_freeze_reasons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_he text not null,
  label_en text,
  sort_order integer not null default 1000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists managed_planning_domains (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_he text not null,
  label_en text,
  sort_order integer not null default 1000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists managed_tender_domains (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_he text not null,
  label_en text,
  sort_order integer not null default 1000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table managed_planners enable row level security;
alter table managed_delay_reasons enable row level security;
alter table managed_freeze_reasons enable row level security;
alter table managed_planning_domains enable row level security;
alter table managed_tender_domains enable row level security;

create policy managed_planners_read on managed_planners for select using (current_user_state() = 'active');
create policy managed_planners_write on managed_planners for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo'));

create policy managed_delay_reasons_read on managed_delay_reasons for select using (current_user_state() = 'active');
create policy managed_delay_reasons_write on managed_delay_reasons for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo'));

create policy managed_freeze_reasons_read on managed_freeze_reasons for select using (current_user_state() = 'active');
create policy managed_freeze_reasons_write on managed_freeze_reasons for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo'));

create policy managed_planning_domains_read on managed_planning_domains for select using (current_user_state() = 'active');
create policy managed_planning_domains_write on managed_planning_domains for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo'));

create policy managed_tender_domains_read on managed_tender_domains for select using (current_user_state() = 'active');
create policy managed_tender_domains_write on managed_tender_domains for all
using (current_user_state() = 'active' and current_app_role() in ('admin','pmo'))
with check (current_user_state() = 'active' and current_app_role() in ('admin','pmo'));
