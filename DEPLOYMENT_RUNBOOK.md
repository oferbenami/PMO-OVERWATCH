# Deployment Runbook (PMO-OVERWATCH)

## Current Live URLs
- Production: https://pmo-overwatch.vercel.app
- Latest staging preview changes per deploy output in CLI.

## Completed
- Vercel project created and linked: `pmo-overwatch`
- Staging and production deployments executed successfully.
- Smoke tests passed:
  - `GET /api/health`
  - `GET /api/projects`
- Next.js upgraded to `15.5.15`.

## Remaining Required Inputs (from owner)
1. `SUPABASE_ACCESS_TOKEN` for CLI automation.
2. Supabase project URLs/keys for staging and production.
3. Google OAuth client ID/secret and approved redirect URIs.

## Commands
- Preview deploy: `powershell -File scripts/deploy.ps1 -Target preview`
- Production deploy: `powershell -File scripts/deploy.ps1 -Target production`
- Health smoke: `vercel curl /api/health --deployment https://pmo-overwatch.vercel.app`
- Projects smoke: `vercel curl /api/projects --deployment https://pmo-overwatch.vercel.app`

## Supabase (once token is available)
- Login: `npx supabase login`
- List projects: `npx supabase projects list`
- Link each env and run migration SQL from:
  - `supabase/migrations/20260428_001_init.sql`
  - `supabase/seed/seed.sql` (optional)

## Vercel env vars to set (both preview + production)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
