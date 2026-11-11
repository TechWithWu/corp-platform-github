[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# ==========================================
# 1. Define Core Configuration Variables
# ==========================================
$subName       = "corp-platform-bootstrap-prod"
$aliasName     = "corp-platform-bootstrap-prod-alias"
$githubOrgRepo = "TechWithWu/corp-platform-github"

$scriptsDir = Join-Path -Path $PSScriptRoot -ChildPath "scripts"

# ==========================================
# 2. Provision / Set Azure Subscription
# ==========================================
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Step 1: Provisioning / Setting Subscription Context" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$genSubScript = Join-Path -Path $scriptsDir -ChildPath "generatesubscription.ps1"
& $genSubScript -subName $subName -aliasName $aliasName

# Retrieve Context IDs explicitly
$subscriptionId = (az account show --query id -o tsv)
$tenantId       = (az account show --query tenantId -o tsv)

if ([string]::IsNullOrWhiteSpace($subscriptionId) -or [string]::IsNullOrWhiteSpace($tenantId)) {
    Write-Error "Failed to acquire valid Subscription ID or Tenant ID. Exiting bootstrap process."
    exit 1
}

# ==========================================
# 3. Configure Azure AD OIDC & GitHub Secrets
# ==========================================
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Step 2: Configuring Azure OIDC & GitHub Secrets" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$oidcScript = Join-Path -Path $scriptsDir -ChildPath "configureOIDC.ps1"
& $oidcScript `
    -githubOrgRepo $githubOrgRepo `
    -subscriptionId $subscriptionId `
    -tenantId $tenantId

# ==========================================
# 4. Configure GitHub Repository Branch Protection
# ==========================================
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Step 3: Applying GitHub Branch Protection Rules" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$branchScript = Join-Path -Path $scriptsDir -ChildPath "branchProtection.ps1"
& $branchScript -githubOrgRepo $githubOrgRepo

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Bootstrap Execution Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green