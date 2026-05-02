# Stage 2 API/Domain Hardening Report

Date: 2026-05-01
Scope: Chapter 11 schedule API/domain hardening only

## Changes implemented
- Added strict error handling for topic baseline updates in `PATCH /api/projects/[id]/schedule`.
  - If rebaseline update fails for any topic row, endpoint now returns 500 with explicit DB error.
- Added explicit `topic_forecast_history` write validation in `PATCH /api/projects/[id]/topics/[topicIndex]/schedule`.
  - If history insert fails, endpoint now returns 500 with explicit DB error.
- Unified warnings payload typing in topic schedule route using `ProjectWarning[]`.

## Validation
- `npm run typecheck` passed.
- `npx supabase migration list` still local=remote aligned.
- Remote table access check passed:
  - `select count(*) from topic_forecast_history` executed successfully.

## Notes
- Warning behavior `actual < target` remains non-blocking as required.
- Local-only rule remains intact: no cross-topic or milestone cascading from topic schedule updates.
