# IMPLEMENTATION NEXT STAGES PLAN

## Summary
????? ????? ?????? ??????, ?? ????? ???? ?? ??? ??????, ???? commit+push ???? ??????.

## Stages
1. Stage 1 - DB and migration stabilization
2. Stage 2 - Chapter 11 API/Domain hardening
3. Stage 3 - UI E2E closure for chapters 4/5/6/11
4. Stage 4 - Regression and stable smoke
5. Stage 5 - Documentation and release handoff

## Stage Protocol
- Implement only current stage scope.
- Run relevant validation checks.
- Commit focused changes for the stage.
- Push to GitHub.
- Report: completed work, passed checks, commit hash.
- Stop and request approval before next stage.

## Test Gates
1. `npx supabase migration list` local=remote.
2. `npm run typecheck` from Stage 2 onward.
3. Schedule API checks (GET/PATCH) pass.
4. Soft/Hard warning behavior for chapters 4/5/11 is validated.
5. Basic smoke for dashboard/project/quick-update passes.
