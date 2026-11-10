# 1. Login to Azure
az login

# 2. Azure Subscription Provisioning Strategy
# ----------------------------------------------------------------------------------
# IMPORTANT NOTE ON SUBSCRIPTION CREATION:
# Azure CLI (`az account alias create`) only supports programmatic subscription creation
# under Enterprise Agreement (EA), Microsoft Customer Agreement (MCA), or MPA billing scopes.
# 
# For Pay-As-You-Go, Free Trial, or Azure for Students accounts, subscriptions CANNOT 
# be created via CLI due to financial risk controls. They must be created manually in 
# the Azure Portal (Azure Portal -> Subscriptions -> Add).
# ----------------------------------------------------------------------------------

$subName = "corp-platform-bootstrap-prod"
$aliasName = "corp-platform-bootstrap-prod-alias"

# --- Option A: Enterprise Automated Provisioning (EA / MCA) ---
# Uncomment the block below if your account has Enterprise Billing permissions:
<#
$billingScope = "/providers/Microsoft.Billing/enrollmentAccounts/YOUR_ENROLLMENT_ACCOUNT_ID"
Write-Host "Creating subscription '$subName' via Azure Billing Scope..." -ForegroundColor Cyans
az account alias create `
    --name $aliasName `
    --billing-scope $billingScope `
    --display-name $subName `
    --workload "Production" | Out-Null
#>

# --- Option B: Manual Provisioning Fallback (Pay-As-You-Go / Portal) ---
# If created manually in Azure Portal, ensure you set the context to the created subscription:
Write-Host "Setting active subscription context to: $subName..." -ForegroundColor Cyan
az account set --subscription $subName

# Retrieve active subscription ID and tenant ID for down-stream OIDC configuration
$subscriptionId = (az account show --query id -o tsv)
$tenantId = (az account show --query tenantId -o tsv)

Write-Host "Active Subscription ID: $subscriptionId"
Write-Host "Active Tenant ID:       $tenantId"

# 3. Create Azure AD App and Service Principal for GitHub Actions OIDC
$appName = "sp-github-actions-bootstrap"
Write-Host "Creating Azure AD Application: $appName..." -ForegroundColor Cyan

$app = az ad app create --display-name $appName | ConvertFrom-Json
$appId = $app.appId
$appObjectId = $app.id

# Create the corresponding Service Principal
az ad sp create --id $appId | Out-Null

# 4. Assign Contributor role to the Service Principal over the Bootstrap Subscription
Write-Host "Assigning 'Contributor' role to Service Principal over subscription Scope..." -ForegroundColor Cyan
az role assignment create --assignee $appId --role "Contributor" --scope "/subscriptions/$subscriptionId" | Out-Null

# 5. Configure Federated Credentials for GitHub Actions OIDC (Passwordless Auth)
# [Important] Replace "YOUR_GITHUB_ORG_OR_USER/YOUR_REPO" with your actual repository path.
$githubOrgRepo = "YOUR_GITHUB_ORG_OR_USER/YOUR_REPO"

# Define the list of environments and subjects you want to support
$federatedCredentials = @(
    @{
        Name    = "github-actions-prod-env"
        Subject = "repo:$githubOrgRepo:environment:production"
        Desc    = "GitHub Actions OIDC for Production Environment"
    },
    @{
        Name    = "github-actions-dev-env"
        Subject = "repo:$githubOrgRepo:environment:development"
        Desc    = "GitHub Actions OIDC for Development Environment"
    },
    @{
        Name    = "github-actions-pr-env"
        Subject = "repo:$githubOrgRepo:pull_request"
        Desc    = "GitHub Actions OIDC for Pull Request Validation"
    }
)

foreach ($cred in $federatedCredentials) {
    $credentialName = $cred.Name
    $subject = $cred.Subject
    $description = $cred.Desc

    Write-Host "Checking federated credential: '$credentialName'..." -ForegroundColor Cyan
    $existingCred = az ad app federated-credential list --id $appObjectId --query "[?name=='$credentialName'] | length(@)" -o tsv

    if ([int]$existingCred -eq 0) {
        Write-Host "Creating OIDC Federated Credential [$credentialName]..." -ForegroundColor Yellow
        az ad app federated-credential create --id $appObjectId --parameters "{
            `"name`": `"$credentialName`",
            `"issuer`": `"https://token.actions.githubusercontent.com`",
            `"subject`": `"$subject`",
            `"description`": `"$description`",
            `"audiences`": [`"api://AzureADTokenExchange`"]
        }" | Out-Null
    } else {
        Write-Host "Federated credential '$credentialName' already exists. Skipping." -ForegroundColor Green
    }
}

# 6. Output GitHub Actions Environment Secrets
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  Azure OIDC Credentials for GitHub Secrets" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "AZURE_CLIENT_ID:      $appId"
Write-Host "AZURE_TENANT_ID:      $tenantId"
Write-Host "AZURE_SUBSCRIPTION_ID: $subscriptionId"
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Please add these values to GitHub Repo Secrets (Settings -> Secrets and variables -> Actions)." -ForegroundColor Yellow