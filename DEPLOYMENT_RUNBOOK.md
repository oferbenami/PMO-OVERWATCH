# Deployment Runbook (PMO-OVERWATCH)

## Current Live URLs
- Production: https://pmo-overwatch.vercel.app
- Staging branch preview: generated per `staging` branch deployment in Vercel.

## Completed (Stages 1-4)
- DB migration chain stabilized with unique versions.
- Local/Remote migration alignment verified.
- Chapter 11 schedule model deployed (API + domain + UI integration).
- Topic 3/4/5/6 milestone flows integrated in Project Card and Quick Update.
- Regression checks completed:
  - `npm run typecheck` passes
  - migration alignment preserved

## Remaining Required Inputs (from owner)
1. Google OAuth client credentials for Supabase Auth.
2. Final confirmation that Google Console redirect URIs match Supabase callback + production domain.

## Pre-Deploy Gates (Mandatory)
1. `npm run typecheck`
2. `npx supabase migration list` -> must show full Local=Remote alignment
3. Confirm no unintended unstaged/dirty changes for release scope

## Commands
- Preview deploy: `powershell -File scripts/deploy.ps1 -Target preview`
- Production deploy: `powershell -File scripts/deploy.ps1 -Target production`
- Go-live gate: `powershell -File scripts/go-live-gate.ps1`
- Rollback: `powershell -File scripts/rollback.ps1 -DeploymentIdOrUrl <deployment>`

## Smoke Procedure (Primary + Fallback)
1. Run primary smoke:
   - `powershell -File scripts/go-live-gate.ps1`
2. If smoke fails with `connect EACCES ...:443` from Vercel CLI:
   - classify as infrastructure/network transport issue
   - run fallback checks:
     - `vercel curl /api/health --deployment https://pmo-overwatch.vercel.app`
     - `vercel curl /api/projects --deployment https://pmo-overwatch.vercel.app`
     - `vercel curl /dashboard --deployment https://pmo-overwatch.vercel.app`
   - document result and continue only if fallback checks are green

## Release Checklist
1. Gates passed (`typecheck`, `migration list`)
2. Stage reports committed for relevant release scope
3. Push to `master`
4. Deploy production
5. Run smoke primary/fallback
6. Record deployment URL + validation outcome

## Vercel env vars in use
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Notes
- Production source branch remains `master`.
- Preview governance is configured on `staging` branch.
