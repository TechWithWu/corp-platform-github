[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$githubOrgRepo, 
    
    [Parameter(Mandatory = $true)]
    [string]$subscriptionId,

    [Parameter(Mandatory = $true)]
    [string]$tenantId
)

$ErrorActionPreference = 'Stop'

# 1. Create or Retrieve Azure AD App and Service Principal
$appName = "sp-github-actions-bootstrap"
Write-Host "Checking Azure AD Application: $appName..." -ForegroundColor Cyan

$existingAppJson = az ad app list --display-name $appName --query "[0]" -o json
if ($existingAppJson -and $existingAppJson -ne "null") {
    $app = $existingAppJson | ConvertFrom-Json
    Write-Host "Found existing Azure AD Application (App ID: $($app.appId))." -ForegroundColor Green
} else {
    Write-Host "Creating Azure AD Application: $appName..." -ForegroundColor Cyan
    $app = az ad app create --display-name $appName | ConvertFrom-Json
}

$appId       = $app.appId
$appObjectId = $app.id

# Create Service Principal if not exists
$sp = az ad sp show --id $appId --query id -o tsv 2>$null
if (-not $sp) {
    Write-Host "Creating Service Principal for App ID: $appId..." -ForegroundColor Cyan
    az ad sp create --id $appId | Out-Null
}

# 2. Assign Contributor role to the Service Principal over Subscription Scope
Write-Host "Checking 'Contributor' role assignment over subscription scope..." -ForegroundColor Cyan
$subScope = "/subscriptions/$subscriptionId"
$existingRole = az role assignment list --assignee $appId --role "Contributor" --scope $subScope --query "[| length(@)]" -o tsv 2>$null

if ([int]$existingRole -eq 0) {
    Write-Host "Assigning 'Contributor' role..." -ForegroundColor Yellow
    az role assignment create --assignee $appId --role "Contributor" --scope $subScope | Out-Null
} else {
    Write-Host "Role 'Contributor' is already assigned." -ForegroundColor Green
}

# 3. Configure Federated Credentials for GitHub Actions OIDC
Write-Host "Fetching GitHub repository and organization numeric IDs via GitHub REST API..." -ForegroundColor Cyan
$repoRest = gh api "repos/$githubOrgRepo" --jq '{owner: .owner.login, owner_id: .owner.id, repo: .name, repo_id: .id}' | ConvertFrom-Json

$orgName  = $repoRest.owner
$orgId    = $repoRest.owner_id
$repoName = $repoRest.repo
$repoId   = $repoRest.repo_id

Write-Host "-> Org: $orgName (Numeric ID: $orgId)" -ForegroundColor Green
Write-Host "-> Repo: $repoName (Numeric ID: $repoId)" -ForegroundColor Green

if (-not $orgId -or -not $repoId) {
    Write-Error "Failed to retrieve valid numeric IDs from GitHub. Please check network or gh auth token."
    exit 1
}

$federatedCredentials = @(
    @{
        Name    = "github-actions-prod-env"
        Subject = "repo:${orgName}@${orgId}/${repoName}@${repoId}:environment:prod"
        Desc    = "GitHub Actions OIDC for Production Environment"
    },
    @{
        Name    = "github-actions-pr"
        Subject = "repo:${orgName}@${orgId}/${repoName}@${repoId}:pull_request"
        Desc    = "GitHub Actions OIDC for Pull Request Validation"
    }
)

foreach ($cred in $federatedCredentials) {
    $credentialName = $cred.Name
    $subject        = $cred.Subject
    $description    = $cred.Desc

    Write-Host "Checking federated credential: '$credentialName'..." -ForegroundColor Cyan
    $existingCred = az ad app federated-credential list --id $appObjectId --query "[?name=='$credentialName'] | length(@)" -o tsv

    if ([int]$existingCred -eq 0) {
        Write-Host "Creating OIDC Federated Credential [$credentialName]..." -ForegroundColor Yellow
        
        $params = @{
            name        = $credentialName
            issuer      = "https://token.actions.githubusercontent.com"
            subject     = $subject
            description = $description
            audiences   = @("api://AzureADTokenExchange")
        }

        $tempFile = [System.IO.Path]::GetTempFileName()
        try {
            $params | ConvertTo-Json -Compress | Set-Content -Path $tempFile -Encoding utf8
            az ad app federated-credential create --id $appObjectId --parameters "@$tempFile" | Out-Null
        } finally {
            if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
        }
    } else {
        Write-Host "Federated credential '$credentialName' already exists. Skipping." -ForegroundColor Green
    }
}

# 4. Output GitHub Actions Environment Secrets Summary
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  Azure OIDC Credentials for GitHub Secrets" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "AZURE_CLIENT_ID:       $appId"
Write-Host "AZURE_TENANT_ID:       $tenantId"
Write-Host "AZURE_SUBSCRIPTION_ID: $subscriptionId"
Write-Host "==========================================" -ForegroundColor Green

# 5. Push Secrets to GitHub Environment
$targetEnv = "prod"

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Storing Secrets to GitHub Environment: [$targetEnv]" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

gh api -X PUT "repos/$orgName/$repoName/environments/$targetEnv" | Out-Null

Write-Host "Setting AZURE_CLIENT_ID in environment '$targetEnv'..." -ForegroundColor Cyan
$appId | gh secret set AZURE_CLIENT_ID --env $targetEnv

Write-Host "Setting AZURE_TENANT_ID in environment '$targetEnv'..." -ForegroundColor Cyan
$tenantId | gh secret set AZURE_TENANT_ID --env $targetEnv

Write-Host "Setting AZURE_SUBSCRIPTION_ID in environment '$targetEnv'..." -ForegroundColor Cyan
$subscriptionId | gh secret set AZURE_SUBSCRIPTION_ID --env $targetEnv

Write-Host "Successfully pushed credentials to GitHub '$targetEnv' environment secrets!" -ForegroundColor Green
