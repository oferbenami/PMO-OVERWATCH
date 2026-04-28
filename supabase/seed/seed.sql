insert into users_profile (id, email, full_name, role, state)
values
  ('00000000-0000-0000-0000-000000000001', 'admin@pmo.local', 'System Admin', 'admin', 'active')
on conflict do nothing;

insert into projects (
  project_code, project_name, expected_asset_receipt_date, occupancy_target, occupancy_forecast, priority, computed_project_status
)
values
  ('PRJ-001', 'סניף ירושלים מרכז', '2026-06-01', '2026-09-01', '2026-09-10', 'high', 'at_risk')
on conflict do nothing;
