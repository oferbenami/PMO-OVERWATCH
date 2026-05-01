-- Phase 1 - Chapter 5 Topic 5 alignment (Approvals & Occupancy)

alter table milestones
  add column if not exists milestone_index int,
  add column if not exists is_not_relevant boolean not null default false;

create unique index if not exists milestones_topic_milestone_index_uniq
  on milestones(topic_id, milestone_index)
  where milestone_index is not null;

create table if not exists topic5_milestone_templates (
  topic5_index int primary key check (topic5_index between 1 and 11),
  milestone_name_he text not null
);

insert into topic5_milestone_templates (topic5_index, milestone_name_he)
values
  (1, 'אישור יועץ בטיחות'),
  (2, 'אישור כיבוי אש'),
  (3, 'אישור נגישות'),
  (4, 'אישור פיקוח'),
  (5, 'אישור מתכנן מיזוג'),
  (6, 'אישור מתכנן חשמל'),
  (7, 'אישור אדריכל'),
  (8, 'אישור אכלוס עירייה'),
  (9, 'נשלחו הודעות ללקוחות'),
  (10, 'פורסמו הנחיות ביצוע פנימיות'),
  (11, 'כניסה בפועל לאכלוס')
on conflict (topic5_index) do update
set milestone_name_he = excluded.milestone_name_he;

insert into milestones (topic_id, milestone_index, milestone_name_he, status)
select pt.id, tmpl.topic5_index, tmpl.milestone_name_he, 'on_track'::status_code
from project_topics pt
join topic5_milestone_templates tmpl on true
left join milestones m
  on m.topic_id = pt.id
 and m.milestone_index = tmpl.topic5_index
where pt.topic_index = 5
  and m.id is null;

-- Backfill milestone_index for old Topic 5 rows that were created without an index.
with topic5_ordered as (
  select
    m.id,
    row_number() over (partition by m.topic_id order by m.id) as rn
  from milestones m
  join project_topics pt on pt.id = m.topic_id
  where pt.topic_index = 5
    and m.milestone_index is null
)
update milestones m
set milestone_index = topic5_ordered.rn
from topic5_ordered
where m.id = topic5_ordered.id
  and topic5_ordered.rn between 1 and 11;
