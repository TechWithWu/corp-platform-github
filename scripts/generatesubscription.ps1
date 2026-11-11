[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$subName,

    [Parameter(Mandatory = $true)]
    [string]$aliasName
)

$ErrorActionPreference = 'Stop'

# 1. Verify Azure CLI Login State
Write-Host "Checking Azure CLI account status..." -ForegroundColor Cyan
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "No active login found. Initiating Azure login..." -ForegroundColor Yellow
    az login | Out-Null
}

# 2. Azure Subscription Provisioning Strategy
# ----------------------------------------------------------------------------------
# IMPORTANT NOTE ON SUBSCRIPTION CREATION:
# Azure CLI (`az account alias create`) only supports programmatic subscription creation
# under Enterprise Agreement (EA), Microsoft Customer Agreement (MCA), or MPA billing scopes.
# ----------------------------------------------------------------------------------

# --- Option A: Enterprise Automated Provisioning (EA / MCA) ---
<#
$billingScope = "/providers/Microsoft.Billing/enrollmentAccounts/YOUR_ENROLLMENT_ACCOUNT_ID"
Write-Host "Creating subscription '$subName' via Azure Billing Scope..." -ForegroundColor Cyan
az account alias create `
    --name $aliasName `
    --billing-scope $billingScope `
    --display-name $subName `
    --workload "Production" | Out-Null
#>

# --- Option B: Manual Provisioning Fallback (Pay-As-You-Go / Portal) ---
$currentSubName = (az account show --query name -o tsv 2>$null)
if ($currentSubName -ne $subName) {
    Write-Host "Setting active subscription context to: $subName..." -ForegroundColor Cyan
    az account set --subscription $subName
} else {
    Write-Host "Active subscription is already set to '$subName'. Skipping context switch." -ForegroundColor Green
}

# Retrieve active subscription ID and tenant ID for down-stream OIDC configuration
$subscriptionId = (az account show --query id -o tsv)
$tenantId       = (az account show --query tenantId -o tsv)

Write-Host "Active Subscription ID: $subscriptionId" -ForegroundColor Green
Write-Host "Active Tenant ID:       $tenantId" -ForegroundColor Green