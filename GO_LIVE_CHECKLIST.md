# PMO-OVERWATCH Production Go-Live Checklist

## Production URL
- https://pmo-overwatch.vercel.app

## Completed Automatically
- Vercel project linked to GitHub repository.
- Production environment variables configured.
- Preview environment variables configured for `staging` branch.
- Supabase linked + migrations pushed + seed applied.
- Production deployed from latest `master`.
- Smoke API checks passed (`/api/health`, `/api/projects`).

## Remaining Human Inputs
1. Google OAuth credentials in Supabase:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
2. Confirm Google Console redirect URIs include production callback for Supabase Auth.

## Go-Live Gate (must pass)
1. Run: `powershell -File scripts/go-live-gate.ps1`
2. Validate role matrix manually in UI:
   - Admin
   - PMO
   - Project Manager
   - View Only
3. Validate pending-user approval flow after Google sign-in.
4. Validate mobile UI at 360/390/414/768/1024 widths.

## Rollback
- List deployments: `vercel list pmo-overwatch`
- Rollback: `powershell -File scripts/rollback.ps1 -DeploymentIdOrUrl <deployment>`

## Post Go-Live (24-48h)
1. Check deployment logs: `vercel logs https://pmo-overwatch.vercel.app`
2. Re-run smoke script every release.
3. Verify `/api/projects` continues returning live Supabase data.
