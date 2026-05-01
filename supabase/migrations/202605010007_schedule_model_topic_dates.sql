-- Phase 1 - Chapter 11 Schedule & Date Model

alter table project_topics
  add column if not exists original_target_date date;

create table if not exists topic_forecast_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  topic_id uuid not null references project_topics(id) on delete cascade,
  topic_index int not null,
  previous_forecast_date date,
  next_forecast_date date,
  changed_at timestamptz not null default now(),
  changed_by uuid
);

create index if not exists topic_forecast_history_project_topic_idx
  on topic_forecast_history(project_id, topic_id, changed_at desc);
