-- Phase 1 - Chapter 6 Topic 6 alignment (Post-Occupancy)

alter table milestones
  add column if not exists subtopic_index int,
  add column if not exists subtopic_name_he text;

create table if not exists topic6_milestone_templates (
  milestone_index int primary key check (milestone_index between 1 and 7),
  subtopic_index int not null check (subtopic_index between 1 and 5),
  subtopic_name_he text not null,
  milestone_name_he text not null
);

insert into topic6_milestone_templates (milestone_index, subtopic_index, subtopic_name_he, milestone_name_he)
values
  (1, 1, 'מסירה ותיעוד', 'מסירה ותיעוד'),
  (2, 2, 'בדק ואחריות', 'בדק ואחריות'),
  (3, 3, 'העברה לאחזקה', 'העברה לאחזקה'),
  (4, 4, 'סגירה אדמיניסטרטיבית', 'סגירה אדמיניסטרטיבית'),
  (5, 5, 'החזרת הנכס הקודם', 'תיאום פינוי'),
  (6, 5, 'החזרת הנכס הקודם', 'תיקונים / השבה למצב נדרש'),
  (7, 5, 'החזרת הנכס הקודם', 'מסירה לגורם מקבל / בעל הנכס')
on conflict (milestone_index) do update
set
  subtopic_index = excluded.subtopic_index,
  subtopic_name_he = excluded.subtopic_name_he,
  milestone_name_he = excluded.milestone_name_he;

insert into milestones (topic_id, milestone_index, subtopic_index, subtopic_name_he, milestone_name_he, status)
select pt.id, tmpl.milestone_index, tmpl.subtopic_index, tmpl.subtopic_name_he, tmpl.milestone_name_he, 'on_track'::status_code
from project_topics pt
join topic6_milestone_templates tmpl on true
left join milestones m
  on m.topic_id = pt.id
 and m.milestone_index = tmpl.milestone_index
where pt.topic_index = 6
  and m.id is null;

update milestones m
set
  subtopic_index = tmpl.subtopic_index,
  subtopic_name_he = tmpl.subtopic_name_he
from project_topics pt
join topic6_milestone_templates tmpl
  on tmpl.milestone_index = m.milestone_index
where m.topic_id = pt.id
  and pt.topic_index = 6
  and (m.subtopic_index is null or m.subtopic_name_he is null);
