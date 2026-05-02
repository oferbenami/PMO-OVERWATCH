# Stage 4 Regression and Smoke Report

Date: 2026-05-02
Scope: regression + operational smoke

## Checks run
- `npm run typecheck` -> PASS
- `npx supabase migration list` -> PASS (Local/Remote fully aligned)
- `powershell -File scripts/go-live-gate.ps1` -> PARTIAL

## Smoke details
- Passed:
  - API health step started successfully
  - API projects step started successfully
  - `/dashboard` HTML OK
  - `/management-report` HTML OK
- Blocked by environment/network:
  - Forward-view step failed with repeated `connect EACCES ...:443` from Vercel CLI transport

## Regression conclusion
- No type-level regressions detected.
- DB migration consistency intact.
- Smoke flow is partially verified; remaining failure is network/CLI transport related rather than app compile/runtime failure.
