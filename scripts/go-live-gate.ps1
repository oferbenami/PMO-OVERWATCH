param(
  [string]$Deployment = "https://pmo-overwatch.vercel.app"
)

$ErrorActionPreference = "Stop"

Write-Host "[1/6] API health" -ForegroundColor Cyan
vercel curl /api/health --deployment $Deployment

Write-Host "[2/6] API projects" -ForegroundColor Cyan
vercel curl /api/projects --deployment $Deployment

Write-Host "[3/6] Dashboard HTML" -ForegroundColor Cyan
vercel curl /dashboard --deployment $Deployment | Out-Null
Write-Host "OK /dashboard"

Write-Host "[4/6] Management report HTML" -ForegroundColor Cyan
vercel curl /management-report --deployment $Deployment | Out-Null
Write-Host "OK /management-report"

Write-Host "[5/6] Forward view HTML" -ForegroundColor Cyan
vercel curl /forward-view --deployment $Deployment | Out-Null
Write-Host "OK /forward-view"

Write-Host "[6/6] Quick update HTML" -ForegroundColor Cyan
vercel curl /quick-update --deployment $Deployment | Out-Null
Write-Host "OK /quick-update"

Write-Host "Go-live smoke completed for $Deployment" -ForegroundColor Green
