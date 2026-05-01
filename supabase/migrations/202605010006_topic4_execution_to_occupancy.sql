-- Phase 1 - Chapter 8 Topic 4 alignment (Execution to Occupancy)

create table if not exists topic4_milestone_templates (
  milestone_index int primary key check (milestone_index between 1 and 18),
  milestone_name_he text not null
);

insert into topic4_milestone_templates (milestone_index, milestone_name_he)
values
  (1, 'חתימת קבלן והתניידות'),
  (2, 'ביצוע מערכות תקרה'),
  (3, 'סגירת תקרה'),
  (4, 'ריצוף'),
  (5, 'שירותים'),
  (6, 'מטבח'),
  (7, 'לוח חשמל'),
  (8, 'ריהוט'),
  (9, 'תשתית תקשורת'),
  (10, 'תשתית ביטחון'),
  (11, 'חדר ממ"ד'),
  (12, 'התקנת עמדות שירות עצמי'),
  (13, 'שילוט חוץ'),
  (14, 'מיתוג פנים'),
  (15, 'גינון / צמחייה'),
  (16, 'אספקת כיסאות'),
  (17, 'אספקת ציוד מטבח'),
  (18, 'מסירה פנימית מוכנה לאישורים')
on conflict (milestone_index) do update
set milestone_name_he = excluded.milestone_name_he;

insert into milestones (topic_id, milestone_index, milestone_name_he, status)
select pt.id, tmpl.milestone_index, tmpl.milestone_name_he, 'on_track'::status_code
from project_topics pt
join topic4_milestone_templates tmpl on true
left join milestones m
  on m.topic_id = pt.id
 and m.milestone_index = tmpl.milestone_index
where pt.topic_index = 4
  and m.id is null;
