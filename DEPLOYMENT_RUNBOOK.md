# Deployment Runbook (PMO-OVERWATCH)

## Current Live URLs
- Production: https://pmo-overwatch.vercel.app
- Staging branch preview: generated per `staging` branch deployment in Vercel.

## Completed
- Vercel project created, linked, and connected to GitHub.
- Production env vars configured.
- Preview env vars configured for branch `staging`.
- Supabase linked to `dlxmhouhhfhzmtcawjdf`.
- Remote migration + seed applied.
- Next.js upgraded to `15.5.15`.
- Production smoke checks passed:
  - `GET /api/health`
  - `GET /api/projects`

## Remaining Required Inputs (from owner)
1. Google OAuth client credentials for Supabase Auth.
2. Final confirmation that Google Console redirect URIs match Supabase callback + production domain.

## Commands
- Preview deploy: `powershell -File scripts/deploy.ps1 -Target preview`
- Production deploy: `powershell -File scripts/deploy.ps1 -Target production`
- Go-live gate: `powershell -File scripts/go-live-gate.ps1`
- Rollback: `powershell -File scripts/rollback.ps1 -DeploymentIdOrUrl <deployment>`

## Vercel env vars in use
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Notes
- Production source branch remains `master`.
- Preview governance is configured on `staging` branch.
