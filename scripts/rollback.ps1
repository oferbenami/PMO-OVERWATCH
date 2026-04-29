param(
  [Parameter(Mandatory = $true)]
  [string]$DeploymentIdOrUrl
)

$ErrorActionPreference = "Stop"
Write-Host "Rolling back to deployment: $DeploymentIdOrUrl" -ForegroundColor Yellow
vercel rollback $DeploymentIdOrUrl --yes
Write-Host "Rollback command completed." -ForegroundColor Green
