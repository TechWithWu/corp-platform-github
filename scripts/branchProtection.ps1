[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$githubOrgRepo,

    [Parameter(Mandatory = $false)]
    [string]$TargetBranch = 'main',

    [Parameter(Mandatory = $false)]
    [int]$RequiredApprovals = 1,

    [Parameter(Mandatory = $false)]
    [string]$RequiredStatusChecks = 'Terraform Unit Tests, Terraform Plan'
)

$ErrorActionPreference = 'Stop'

# Dynamic Protection Parameters
$DismissStaleReviews           = $true
$RequireCodeOwnerReviews        = $true
$EnforceAdmins                 = $true
$RequireLinearHistory          = $true
$RequireConversationResolution = $true
$AllowForcePushes              = $false
$AllowDeletions                = $false

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Applying Branch Protection to: [$TargetBranch]" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Parse status checks list from comma-separated string
$contexts = $RequiredStatusChecks -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
if (-not $contexts) {
    $contexts = @('Terraform Unit Tests', 'Terraform Plan')
}

# Construct the branch protection payload object
$protectionPayload = @{
    required_status_checks = @{
        strict   = $true
        contexts = $contexts
    }
    enforce_admins = $EnforceAdmins
    required_pull_request_reviews = if ($RequiredApprovals -gt 0) {
        @{
            dismiss_stale_reviews           = $DismissStaleReviews
            require_code_owner_reviews      = $RequireCodeOwnerReviews
            required_approving_review_count = $RequiredApprovals
            require_last_push_approval      = $true
        }
    } else {
        $null
    }
    restrictions = $null
    required_linear_history = $RequireLinearHistory
    allow_force_pushes = $AllowForcePushes
    allow_deletions = $AllowDeletions
    block_creations = $false
    required_conversation_resolution = $RequireConversationResolution
}

# Use GitHub CLI to update protection rules via API
$tempFile = [System.IO.Path]::GetTempFileName()
try {
    Write-Host "Configuring branch protection for repository: $githubOrgRepo..." -ForegroundColor Cyan
    
    $jsonPayload = $protectionPayload | ConvertTo-Json -Depth 10
    $jsonPayload | Set-Content -Path $tempFile -Encoding utf8

    gh api -X PUT "repos/$githubOrgRepo/branches/$TargetBranch/protection" --input $tempFile | Out-Null
    
    Write-Host "Branch protection successfully applied to '$TargetBranch'!" -ForegroundColor Green
}
catch {
    Write-Error "Failed to update branch protection: $_"
    Write-Warning "Ensure you have 'administration: write' permissions or an admin token."
    exit 1
}
finally {
    if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
}

# ==========================================
# 2. Generate Execution Summary Report
# ==========================================
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Security & Branch Protection Summary Report" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$reportMarkdown = @"
## Terraform Repository Security & Branch Protection Report

Branch protection rules have been configured for repository **$githubOrgRepo** on **$TargetBranch**.

| Security Parameter | Configured Value |
|---|---|
| **Target Protected Branch** | `$TargetBranch` |
| **Required Status Checks** | $RequiredStatusChecks |
| **Require Branch Up-to-Date** | `true` (Strict) |
| **Required Approvals** | $RequiredApprovals |
| **Dismiss Stale Reviews** | $DismissStaleReviews |
| **Require Code Owner Review** | $RequireCodeOwnerReviews |
| **Enforce on Administrators** | $EnforceAdmins |
| **Require Linear History** | $RequireLinearHistory |
| **Require Conversation Resolution** | $RequireConversationResolution |
| **Allow Force Pushes** | $AllowForcePushes |
| **Allow Branch Deletions** | $AllowDeletions |

### Summary
The Azure OIDC credentials and secrets pipeline initialization process for **prod** has finished.
"@

$reportMarkdown | Write-Host