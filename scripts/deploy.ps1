param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('preview','production')]
  [string]$Target = 'preview'
)

$ErrorActionPreference = 'Stop'

Write-Host "Building locally..." -ForegroundColor Cyan
npm run build | Out-Host

if ($Target -eq 'preview') {
  Write-Host "Deploying preview..." -ForegroundColor Cyan
  vercel --yes | Out-Host
}
else {
  Write-Host "Deploying production..." -ForegroundColor Cyan
  vercel --prod --yes | Out-Host
}

$deployment = if ($Target -eq 'production') { 'https://pmo-overwatch.vercel.app' } else { '' }
if ($deployment -ne '') {
  Write-Host "Smoke: /api/health" -ForegroundColor Cyan
  vercel curl /api/health --deployment $deployment | Out-Host
  Write-Host "Smoke: /api/projects" -ForegroundColor Cyan
  vercel curl /api/projects --deployment $deployment | Out-Host
}
