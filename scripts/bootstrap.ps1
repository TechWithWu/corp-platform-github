# bootstrap.ps1 - Pure Out-of-Band Setup (Run once by DevOps / SecOps)
# This securely stores Azure OIDC secrets directly in GitHub without passing them through workflow dispatch!

param(
  [Parameter(Mandatory=$true)]
  [string]$AzureClientId,

  [Parameter(Mandatory=$true)]
  [string]$AzureTenantId,

  [Parameter(Mandatory=$true)]
  [string]$AzureSubscriptionId,

  [string]$Environment = "prod"
)

Write-Host "Creating GitHub Environment '$Environment' if not exists..." -ForegroundColor Cyan
gh api --method PUT -H "Accept: application/vnd.github+json" /repos/{owner}/{repo}/environments/$Environment

Write-Host "Securely setting Azure OIDC credentials in environment: $Environment" -ForegroundColor Green
$AzureClientId | gh secret set AZURE_CLIENT_ID --env $Environment
$AzureTenantId | gh secret set AZURE_TENANT_ID --env $Environment
$AzureSubscriptionId | gh secret set AZURE_SUBSCRIPTION_ID --env $Environment

Write-Host "Done! Secrets are encrypted and safely stored. The branch protection workflow remains 100% pure." -ForegroundColor Green
