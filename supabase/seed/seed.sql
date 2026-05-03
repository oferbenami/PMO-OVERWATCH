insert into users_profile (id, email, full_name, role, state)
values
  ('00000000-0000-0000-0000-000000000001', 'admin@pmo.local', 'System Admin', 'admin', 'active')
on conflict do nothing;

insert into managed_architects (code, full_name, label_he, sort_order, is_active)
values
  ('architect_lead', 'אדריכל מוביל', 'אדריכל מוביל', 10, true),
  ('architect_support', 'אדריכל משני', 'אדריכל משני', 20, true)
on conflict (code) do update
set full_name = excluded.full_name, label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into managed_external_supervisors (code, full_name, label_he, sort_order, is_active)
values
  ('ext_pm_1', 'מפקח חיצוני א', 'מפקח חיצוני א', 10, true),
  ('ext_pm_2', 'מפקח חיצוני ב', 'מפקח חיצוני ב', 20, true)
on conflict (code) do update
set full_name = excluded.full_name, label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into managed_contractors (code, full_name, label_he, sort_order, is_active)
values
  ('contractor_build_mep', 'קבלן ביצוע מעטפת', 'קבלן ביצוע מעטפת', 10, true),
  ('contractor_hvac', 'קבלן מיזוג', 'קבלן מיזוג', 20, true),
  ('contractor_furniture', 'ספק ריהוט', 'ספק ריהוט', 30, true),
  ('contractor_branding', 'ספק מיתוג ושילוט', 'ספק מיתוג ושילוט', 40, true)
on conflict (code) do update
set full_name = excluded.full_name, label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into managed_planners (code, label_he, sort_order, is_active)
values
  ('planner_arch', 'מתכנן אדריכלי', 10, true),
  ('planner_elec', 'מתכנן חשמל', 20, true),
  ('planner_hvac', 'מתכנן מיזוג', 30, true),
  ('planner_safety', 'יועץ בטיחות', 40, true)
on conflict (code) do update
set label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into managed_delay_reasons (code, label_he, sort_order, is_active)
values
  ('approvals_regulation', 'אישורים / רגולציה', 10, true),
  ('planning', 'תכנון', 20, true),
  ('tender_procurement', 'מכרז / רכש', 30, true),
  ('contractor_supplier', 'קבלן / ספק', 40, true),
  ('budget_management_decision', 'תקציב / החלטת הנהלה', 50, true),
  ('external_dependency', 'תלות חיצונית', 60, true),
  ('site_asset_issue', 'בעיית אתר / נכס', 70, true),
  ('change_in_requirements', 'שינוי דרישות', 80, true),
  ('other', 'אחר', 90, true)
on conflict (code) do update
set label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into managed_freeze_reasons (code, label_he, sort_order, is_active)
values
  ('regulation_approvals', 'רגולציה / אישורים', 10, true),
  ('management_decision', 'החלטת הנהלה', 20, true),
  ('budget', 'תקציב', 30, true),
  ('external_party_or_owner', 'גורם חיצוני / בעל נכס', 40, true),
  ('contractor_supplier', 'קבלן / ספק', 50, true),
  ('operational_business_constraint', 'אילוץ תפעולי / עסקי', 60, true),
  ('other', 'אחר', 70, true)
on conflict (code) do update
set label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into managed_planning_domains (code, label_he, sort_order, is_active)
values
  ('architecture', 'אדריכלות', 10, true),
  ('electrical', 'חשמל', 20, true),
  ('plumbing', 'אינסטלציה', 30, true),
  ('hvac', 'מיזוג אוויר', 40, true),
  ('safety', 'בטיחות', 50, true),
  ('accessibility', 'נגישות', 60, true)
on conflict (code) do update
set label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into managed_tender_domains (code, label_he, sort_order, is_active)
values
  ('construction_electrical_plumbing', 'בינוי+חשמל+אינסטלציה', 10, true),
  ('hvac', 'מיזוג אוויר', 20, true),
  ('furniture', 'ריהוט', 30, true),
  ('branding_signage', 'מיתוג ושילוט', 40, true)
on conflict (code) do update
set label_he = excluded.label_he, sort_order = excluded.sort_order, is_active = excluded.is_active, updated_at = now();

insert into projects (
  project_code, project_name, expected_asset_receipt_date, occupancy_target, occupancy_forecast, priority, computed_project_status
)
values
  ('PRJ-001', 'סניף ירושלים מרכז', '2026-06-01', '2026-09-01', '2026-09-10', 'high', 'at_risk')
on conflict do nothing;
