-- Phase 1 - Chapter 7 Topic 3 alignment (Tenders)

create table if not exists topic3_milestone_templates (
  milestone_index int primary key check (milestone_index between 1 and 16),
  subtopic_index int not null check (subtopic_index between 1 and 4),
  subtopic_name_he text not null,
  milestone_name_he text not null
);

insert into topic3_milestone_templates (milestone_index, subtopic_index, subtopic_name_he, milestone_name_he)
values
  (1, 1, 'בינוי, חשמל ואינסטלציה', 'פרסום'),
  (2, 1, 'בינוי, חשמל ואינסטלציה', 'קבלת הצעות'),
  (3, 1, 'בינוי, חשמל ואינסטלציה', 'מו"מ'),
  (4, 1, 'בינוי, חשמל ואינסטלציה', 'אישור ועדת רכש'),
  (5, 2, 'מיזוג אוויר', 'פרסום'),
  (6, 2, 'מיזוג אוויר', 'קבלת הצעות'),
  (7, 2, 'מיזוג אוויר', 'מו"מ'),
  (8, 2, 'מיזוג אוויר', 'אישור ועדת רכש'),
  (9, 3, 'ריהוט', 'פרסום'),
  (10, 3, 'ריהוט', 'קבלת הצעות'),
  (11, 3, 'ריהוט', 'מו"מ'),
  (12, 3, 'ריהוט', 'אישור ועדת רכש'),
  (13, 4, 'מיתוג ושילוט', 'פרסום'),
  (14, 4, 'מיתוג ושילוט', 'קבלת הצעות'),
  (15, 4, 'מיתוג ושילוט', 'מו"מ'),
  (16, 4, 'מיתוג ושילוט', 'אישור ועדת רכש')
on conflict (milestone_index) do update
set
  subtopic_index = excluded.subtopic_index,
  subtopic_name_he = excluded.subtopic_name_he,
  milestone_name_he = excluded.milestone_name_he;

insert into milestones (topic_id, milestone_index, subtopic_index, subtopic_name_he, milestone_name_he, status)
select pt.id, tmpl.milestone_index, tmpl.subtopic_index, tmpl.subtopic_name_he, tmpl.milestone_name_he, 'on_track'::status_code
from project_topics pt
join topic3_milestone_templates tmpl on true
left join milestones m
  on m.topic_id = pt.id
 and m.milestone_index = tmpl.milestone_index
where pt.topic_index = 3
  and m.id is null;

update milestones m
set
  subtopic_index = tmpl.subtopic_index,
  subtopic_name_he = tmpl.subtopic_name_he
from project_topics pt
join topic3_milestone_templates tmpl on true
where m.topic_id = pt.id
  and tmpl.milestone_index = m.milestone_index
  and pt.topic_index = 3
  and (m.subtopic_index is null or m.subtopic_name_he is null);
