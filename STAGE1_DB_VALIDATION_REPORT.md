# Stage 1 DB Validation Report

Date: 2026-05-01
Environment: linked remote Supabase project `dlxmhouhhfhzmtcawjdf`

## Migration chain status
- Local migration files are uniquely versioned and ordered.
- `npx supabase migration list` shows full Local/Remote match:
  - 20260428
  - 202604300002
  - 202604300003
  - 202604300004
  - 202604300005
  - 202605010006
  - 202605010007

## Chapter 11 schema objects
- `project_topics.original_target_date` exists.
- `topic_forecast_history` table exists.
- `topic_forecast_history_project_topic_idx` index exists.

## Backfill sanity check (topics 3/4/5/6)
- Topic 3 milestones: 16
- Topic 4 milestones: 18
- Topic 5 milestones: 11
- Topic 6 milestones: 7

## Notes
- Supabase CLI warns that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are unset in local env; this did not block DB validation.
