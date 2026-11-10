import React, { useState } from 'react';
import {
  FolderGit2,
  FileCode,
  Shield,
  Key,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Lock,
  GitBranch,
  Server,
  Code2,
} from 'lucide-react';
import { DEFAULT_PLATFORM_REPOS, PlatformRepoConfig } from '../data/workflowData';

export const GithubAsCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('main.tf');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [repos, setRepos] = useState<PlatformRepoConfig[]>(DEFAULT_PLATFORM_REPOS);
  const [filterType, setFilterType] = useState<'all' | 'platform' | 'application'>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRepo, setNewRepo] = useState<PlatformRepoConfig>({
    name: 'corp-orders-api',
    type: 'application',
    description: 'Orders Processing Service: checkout flow and fulfillment integration',
    protectedBranches: ['main', 'dev'],
    topics: ['microservice', 'orders', 'api'],
    requiredApprovals: 1,
    prodApprovers: [
      {
        email: 'orders-lead@gmail.com',
        username: 'orderslead',
      },
    ],
    environments: {
      dev: {
        azureClientId: '10000000-0000-0000-0000-000000000099',
        azureTenantId: '88888888-4444-4444-4444-121212121212',
        azureSubscriptionId: '30000000-0000-0000-0000-000000000099',
        scopeDescription: 'Orders Dev Workload Sub',
      },
      qa: {
        azureClientId: '10000000-0000-0000-0000-000000000098',
        azureTenantId: '88888888-4444-4444-4444-121212121212',
        azureSubscriptionId: '30000000-0000-0000-0000-000000000098',
        scopeDescription: 'Orders QA Test Sub',
      },
      cae: {
        azureClientId: '10000000-0000-0000-0000-000000000097',
        azureTenantId: '88888888-4444-4444-4444-121212121212',
        azureSubscriptionId: '30000000-0000-0000-0000-000000000097',
        scopeDescription: 'Orders CAE Staging Sub',
      },
      prod: {
        azureClientId: '20000000-0000-0000-0000-000000000099',
        azureTenantId: '88888888-4444-4444-4444-121212121212',
        azureSubscriptionId: '40000000-0000-0000-0000-000000000099',
        scopeDescription: 'Orders Production Workload Sub',
      },
    },
  });

  const filteredRepos = repos.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const filesContent: Record<string, string> = {
    'repositories.json': `{
  "repositories": [
    {
      "name": "corp-platform-foundation",
      "type": "platform",
      "description": "Enterprise governance: Management Groups, Azure Policy, RBAC baselines, and subscription vending",
      "protected_branches": ["main"],
      "required_approvals": 1,
      "prod_approvers": [{ "email": "seniorguy@gmail.com", "username": "seniorguy" }],
      "topics": ["azure", "landing-zone", "management-groups", "policy"],
      "environments": {
        "prod": { "azure_client_id": "00000000-0000-0000-0000-000000000001", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "22222222-2222-2222-2222-222222222221" }
      }
    },
    {
      "name": "corp-platform-management",
      "type": "platform",
      "description": "Centralized Ops: Log Analytics, Sentinel, Azure Monitor, and alert policies",
      "protected_branches": ["main"],
      "required_approvals": 1,
      "prod_approvers": [{ "email": "ops-lead@gmail.com", "username": "opslead" }],
      "topics": ["azure", "operations", "sentinel", "monitor"],
      "environments": {
        "prod": { "azure_client_id": "00000000-0000-0000-0000-000000000002", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "22222222-2222-2222-2222-222222222222" }
      }
    },
    {
      "name": "corp-platform-connectivity",
      "type": "platform",
      "description": "Centralized Networking: Hub VNet, Azure Firewall, VPN/ExpressRoute, and global NSG rules",
      "protected_branches": ["main"],
      "required_approvals": 1,
      "prod_approvers": [{ "email": "network-lead@gmail.com", "username": "netlead" }],
      "topics": ["azure", "networking", "firewall", "hub-spoke"],
      "environments": {
        "prod": { "azure_client_id": "00000000-0000-0000-0000-000000000003", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "22222222-2222-2222-2222-222222222223" }
      }
    },
    {
      "name": "corp-billing-api",
      "type": "application",
      "description": "Billing Microservice API: invoice generation, payment gateways, and usage metering",
      "protected_branches": ["main", "dev"],
      "required_approvals": 1,
      "prod_approvers": [{ "email": "seniorguy@gmail.com", "username": "seniorguy" }],
      "topics": ["microservice", "billing", "api", "azure-container-apps"],
      "environments": {
        "dev": { "azure_client_id": "10000000-0000-0000-0000-000000000001", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000001" },
        "qa":  { "azure_client_id": "10000000-0000-0000-0000-000000000002", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000002" },
        "cae": { "azure_client_id": "10000000-0000-0000-0000-000000000003", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000003" },
        "prod":{ "azure_client_id": "20000000-0000-0000-0000-000000000001", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "40000000-0000-0000-0000-000000000001" }
      }
    },
    {
      "name": "corp-billing-web",
      "type": "application",
      "description": "Billing Customer Portal: self-service invoicing and billing dashboard frontend",
      "protected_branches": ["main", "dev"],
      "required_approvals": 1,
      "prod_approvers": [{ "email": "billing-web-lead@gmail.com", "username": "billingweblead" }],
      "topics": ["frontend", "billing", "react", "azure-static-web-apps"],
      "environments": {
        "dev": { "azure_client_id": "10000000-0000-0000-0000-000000000011", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000001" },
        "qa":  { "azure_client_id": "10000000-0000-0000-0000-000000000012", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000002" },
        "cae": { "azure_client_id": "10000000-0000-0000-0000-000000000013", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000003" },
        "prod":{ "azure_client_id": "20000000-0000-0000-0000-000000000011", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "40000000-0000-0000-0000-000000000001" }
      }
    },
    {
      "name": "corp-products-api",
      "type": "application",
      "description": "Product Catalog & Pricing Engine: high-performance product queries and pricing rules",
      "protected_branches": ["main", "dev"],
      "required_approvals": 1,
      "prod_approvers": [{ "email": "product-architect@gmail.com", "username": "productarchitect" }],
      "topics": ["microservice", "catalog", "products", "api"],
      "environments": {
        "dev": { "azure_client_id": "10000000-0000-0000-0000-000000000021", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000001" },
        "qa":  { "azure_client_id": "10000000-0000-0000-0000-000000000022", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000002" },
        "cae": { "azure_client_id": "10000000-0000-0000-0000-000000000023", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "30000000-0000-0000-0000-000000000003" },
        "prod":{ "azure_client_id": "20000000-0000-0000-0000-000000000021", "azure_tenant_id": "11111111-1111-1111-1111-111111111111", "azure_subscription_id": "40000000-0000-0000-0000-000000000001" }
      }
    }
  ]
}
`,
    'repositories.tf': `# /githubascode/repositories.tf
# Dynamically loads and parses the decoupled repositories catalog
locals {
  raw_catalog = jsondecode(file("\${path.module}/repositories.json"))

  repositories_catalog = {
    for repo in local.raw_catalog.repositories : repo.name => {
      name               = repo.name
      type               = try(repo.type, "application")
      description        = try(repo.description, "")
      visibility         = try(repo.visibility, "private")
      protected_branches = try(repo.protected_branches, ["main", "dev"])
      required_approvals = try(repo.required_approvals, 1)
      prod_approvers     = try(repo.prod_approvers, [])
      topics             = try(repo.topics, ["terraform"])
      environments = {
        for env_name, env_cfg in repo.environments : env_name => {
          azure_client_id       = try(env_cfg.azure_client_id, "")
          azure_tenant_id       = try(env_cfg.azure_tenant_id, "")
          azure_subscription_id = try(env_cfg.azure_subscription_id, "")
        }
      }
    }
  }

  active_repositories = length(var.repositories) > 0 ? var.repositories : local.repositories_catalog
}
`,
    'main.tf': `# /githubascode/main.tf
# 1. Collect all unique approver usernames across repositories
locals {
  all_prod_approver_usernames = distinct(flatten([
    for repo in local.active_repositories : [
      for approver in try(repo.prod_approvers, []) : approver.username if try(approver.username, "") != ""
    ]
  ]))
}

# 2. Dynamically look up GitHub numeric user IDs for each unique approver
data "github_user" "approvers" {
  for_each = toset(local.all_prod_approver_usernames)
  username = each.value
}

locals {
  approver_username_to_id = {
    for username, user in data.github_user.approvers : username => user.id
  }
}

# 3. Instantiate repository module for all catalog entries
module "repositories" {
  source   = "./modules/repository"
  for_each = local.active_repositories

  name                   = each.key
  description            = each.value.description
  visibility             = coalesce(each.value.visibility, "private")
  topics                 = coalesce(each.value.topics, ["terraform"])

  # Direct commits to both 'main' and 'dev' are BLOCKED (mandatory PR + Code Owners)
  # Status checks are omitted so each repository can execute its own distinct CI/CD pipeline!
  default_branch             = "main"
  protected_branches         = coalesce(each.value.protected_branches, ["main", "dev"])
  enforce_admins             = true
  required_approvals         = coalesce(each.value.required_approvals, 1)
  dismiss_stale_reviews      = true
  require_code_owner_reviews = true

  # Provision 4 environments (dev, qa, cae, prod) with dedicated Azure OIDC
  environments = each.value.environments

  # Approver gate for 'prod' resolved per repository from repositories.json
  prod_reviewer_ids = flatten([
    for approver in try(each.value.prod_approvers, []) :
    contains(keys(local.approver_username_to_id), try(approver.username, "")) ? [local.approver_username_to_id[approver.username]] : []
  ])
}
`,
    'variables.tf': `# /githubascode/variables.tf
# Production environment approvers are decoupled into /githubascode/repositories.json
# because approvers differ across repositories. Status checks are omitted from branch
# protection to allow each repository to define its own pipeline.

variable "repositories" {
  description = "Optional override map. Defaults to empty {} to auto-load /githubascode/repositories.json"
  type = map(object({
    description        = string
    visibility         = optional(string, "private")
    protected_branches = optional(list(string), ["main", "dev"])
    topics             = optional(list(string), ["terraform"])
    required_approvals = optional(number, 1)
    prod_approvers     = optional(list(object({
      email    = string
      username = string
    })), [])
    environments       = map(object({
      azure_client_id       = string
      azure_tenant_id       = string
      azure_subscription_id = string
    }))
  }))
  default = {}
}
`,
    'provider.tf': `# /githubascode/provider.tf
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
  }

  # Azure Storage Account Remote State Backend
  # Stores the Terraform state file securely with state locking in an Azure Blob Storage container.
  # Leverages Azure Workload Identity / OIDC (use_oidc = true) via ARM_* environment variables
  # passed by GitHub Actions without requiring long-lived storage account access keys.
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state-prod"
    storage_account_name = "stcorpghasstateprod"
    container_name       = "tfstate"
    key                  = "githubascode.tfstate"
    use_oidc             = true
  }
}

# The GitHub provider automatically discovers authentication and target scope from standard
# environment variables without hardcoded inputs or variable declarations:
# - GITHUB_TOKEN : Built-in runner token (\${{ secrets.GITHUB_TOKEN }} or \${{ secrets.ADMIN_GITHUB_TOKEN }})
# - GITHUB_OWNER : Built-in organization/owner context (\${{ github.repository_owner }})
provider "github" {}

# Optional AzureRM provider for supplemental Azure resource operations using OIDC
provider "azurerm" {
  features {}
  use_oidc = true
}
`,
    'outputs.tf': `# /githubascode/outputs.tf
output "total_repositories_count" {
  value = length(module.repositories)
}

output "repository_urls" {
  value = { for name, repo in module.repositories : name => repo.html_url }
}

output "provisioned_environments" {
  value = { for name, repo in module.repositories : name => repo.environments }
}

output "protected_branches" {
  value = { for name, repo in module.repositories : name => repo.protected_branches }
}

output "prod_approval_gates" {
  value = {
    for name, repo in local.active_repositories : name => [
      for approver in try(repo.prod_approvers, []) : "\${approver.username} (\${approver.email})"
    ]
  }
}

output "pipeline_status_checks_policy" {
  value = "Status checks are decoupled from branch protection so each repository can execute its own distinct CI/CD pipeline without Terraform coupling."
}
`,
    'terraform.tfvars.example': `# /githubascode/terraform.tfvars.example
# Zero-boilerplate: github_owner and github_token are automatically read from runner environment variables:
#   GITHUB_TOKEN = "\${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}"
#   GITHUB_OWNER = "\${{ github.repository_owner }}"

repositories = {
${repos
  .map(
    (r) => `  "${r.name}" = {
    description        = "${r.description}"
    visibility         = "private"
    protected_branches = [${r.protectedBranches.map((b) => `"${b}"`).join(', ')}]
    required_approvals = ${r.requiredApprovals}
    topics             = [${r.topics.map((t) => `"${t}"`).join(', ')}]
    prod_approvers = [
${(r.prodApprovers || [{ email: 'seniorguy@gmail.com', username: 'seniorguy' }])
  .map((a) => `      { email = "${a.email}", username = "${a.username}" }`)
  .join(',\n')}
    ]
    environments = {
${Object.entries(r.environments)
  .map(
    ([envName, envCfg]) => `      "${envName}" = {
        azure_client_id       = "${envCfg.azureClientId}" # ${envCfg.scopeDescription || ''}
        azure_tenant_id       = "${envCfg.azureTenantId}"
        azure_subscription_id = "${envCfg.azureSubscriptionId}"
      }`
  )
  .join('\n')}
    }
  }`
  )
  .join('\n\n')}
}
`,
    'modules/repository/main.tf': `# /githubascode/modules/repository/main.tf
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = ">= 6.0"
    }
  }
}

# 1. Create GitHub Repository
resource "github_repository" "this" {
  name                   = var.name
  description            = var.description
  visibility             = var.visibility
  auto_init              = true # Initializes with default README.md on main branch
  has_issues             = true
  has_projects           = false
  has_wiki               = false
  delete_branch_on_merge = true
  allow_merge_commit     = false
  allow_squash_merge     = true
  allow_rebase_merge     = false
  topics                 = var.topics
}

# 2. Create Additional Branches (e.g. 'dev') if specified in protected_branches
resource "github_branch" "additional_branches" {
  for_each      = toset([for b in var.protected_branches : b if b != var.default_branch])
  repository    = github_repository.this.name
  branch        = each.value
  source_branch = var.default_branch

  depends_on = [github_repository.this]
}

# 3. Apply Strict Branch Protection to All Protected Branches ('main', 'dev', etc.)
# Rule: Neither 'main' nor 'dev' can be committed to directly; all changes MUST arrive via PR!
# Note: Status checks omitted to allow each repository to define its own pipeline!
resource "github_branch_protection" "protection" {
  for_each = toset(var.protected_branches)

  repository_id                   = github_repository.this.name
  pattern                         = each.value
  enforce_admins                  = var.enforce_admins
  required_linear_history         = true
  allows_force_pushes             = false
  allows_deletions                = false
  require_conversation_resolution = true

  required_pull_request_reviews {
    dismiss_stale_reviews           = var.dismiss_stale_reviews
    require_code_owner_reviews      = var.require_code_owner_reviews
    required_approving_review_count = var.required_approvals
    require_last_push_approval      = true
  }

  depends_on = [
    github_repository.this,
    github_branch.additional_branches
  ]
}

# 4. Provision Environments ('dev', 'qa', 'cae', 'prod') with Approver Gates
resource "github_repository_environment" "environments" {
  for_each          = var.environments
  repository        = github_repository.this.name
  environment       = each.key
  
  # For 'prod', admins cannot bypass approval gates
  can_admins_bypass = each.key == "prod" ? false : true

  # Reviewer approval gate enforced per repository on 'prod' environment
  dynamic "reviewers" {
    for_each = each.key == "prod" && length(var.prod_reviewer_ids) > 0 ? [1] : []
    content {
      users = var.prod_reviewer_ids
    }
  }

  depends_on = [github_repository.this]
}

# 5. Inject Environment-Specific Azure OIDC Client ID
resource "github_actions_environment_secret" "azure_client_id" {
  for_each = {
    for env_name, env_cfg in var.environments : env_name => env_cfg
    if env_cfg.azure_client_id != ""
  }

  repository      = github_repository.this.name
  environment     = github_repository_environment.environments[each.key].environment
  secret_name     = "AZURE_CLIENT_ID"
  plaintext_value = each.value.azure_client_id
}

# 6. Inject Environment-Specific Azure OIDC Tenant ID
resource "github_actions_environment_secret" "azure_tenant_id" {
  for_each = {
    for env_name, env_cfg in var.environments : env_name => env_cfg
    if env_cfg.azure_tenant_id != ""
  }

  repository      = github_repository.this.name
  environment     = github_repository_environment.environments[each.key].environment
  secret_name     = "AZURE_TENANT_ID"
  plaintext_value = each.value.azure_tenant_id
}

# 7. Inject Environment-Specific Azure OIDC Subscription ID
resource "github_actions_environment_secret" "azure_subscription_id" {
  for_each = {
    for env_name, env_cfg in var.environments : env_name => env_cfg
    if env_cfg.azure_subscription_id != ""
  }

  repository      = github_repository.this.name
  environment     = github_repository_environment.environments[each.key].environment
  secret_name     = "AZURE_SUBSCRIPTION_ID"
  plaintext_value = each.value.azure_subscription_id
}
`,
    'modules/repository/variables.tf': `# /githubascode/modules/repository/variables.tf
variable "name" { type = string }
variable "description" { type = string; default = "" }
variable "visibility" { type = string; default = "private" }
variable "topics" { type = list(string); default = ["terraform"] }
variable "default_branch" { type = string; default = "main" }
variable "protected_branches" { type = list(string); default = ["main"] }
variable "enforce_admins" { type = bool; default = true }
variable "required_approvals" { type = number; default = 1 }
variable "dismiss_stale_reviews" { type = bool; default = true }
variable "require_code_owner_reviews" { type = bool; default = true }
variable "prod_reviewer_ids" { type = list(number); default = [] }
variable "environments" {
  type = map(object({
    azure_client_id       = string
    azure_tenant_id       = string
    azure_subscription_id = string
  }))
}
`,
    'modules/repository/outputs.tf': `# /githubascode/modules/repository/outputs.tf
output "repository_name" { value = github_repository.this.name }
output "html_url" { value = github_repository.this.html_url }
output "git_clone_url" { value = github_repository.this.git_clone_url }
output "environments" { value = [for e in github_repository_environment.environments : e.environment] }
output "protected_branches" { value = [for p in github_branch_protection.protection : p.pattern] }
`,
    '.github/workflows/gac.yml': `# /.github/workflows/gac.yml
name: 'GitHub-as-Code (GAC) - Test, Plan & Apply'

on:
  push:
    branches:
      - main
    paths:
      - 'githubascode/**'
  pull_request:
    branches:
      - main
    paths:
      - 'githubascode/**'
  workflow_dispatch:

# Ensure only one Terraform execution runs at a time per ref; never cancel running jobs mid-state!
concurrency:
  group: gac-terraform-\${{ github.ref }}
  cancel-in-progress: false

permissions:
  id-token: write        # Required for Azure OIDC login and Azure Blob Storage state backend access
  contents: read         # Required to check out repository code
  pull-requests: write   # Required to post plan output to PR comments
  issues: write          # Required for GitHub Script REST API commenting

env:
  ARM_CLIENT_ID: \${{ secrets.AZURE_CLIENT_ID }}
  ARM_TENANT_ID: \${{ secrets.AZURE_TENANT_ID }}
  ARM_SUBSCRIPTION_ID: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
  ARM_USE_OIDC: true
  GITHUB_TOKEN: \${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
  GITHUB_OWNER: \${{ github.repository_owner }}
  TF_IN_AUTOMATION: 'true'

jobs:
  terraform-test-and-plan:
    name: 'Terraform Test & Plan'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: githubascode

    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v4

      - name: 'Setup Terraform CLI'
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.9.0
          terraform_wrapper: false

      - name: 'Azure CLI Login (OIDC Passwordless)'
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: 'Terraform Format Check'
        id: fmt
        run: terraform fmt -check

      - name: 'Terraform Init (Azure Storage State Backend)'
        id: init
        run: terraform init

      - name: 'Terraform Validate'
        id: validate
        run: terraform validate

      - name: 'Terraform Test'
        id: test
        run: |
          echo "Executing native Terraform test suites..."
          terraform test

      - name: 'Terraform Plan'
        id: plan
        run: |
          terraform plan -no-color -out=tfplan > plan.out
          cat plan.out

      - name: 'Format Plan Summary'
        id: plan-summary
        run: |
          PLAN_CONTENT=$(cat plan.out)
          delimiter="$(openssl rand -hex 8)"
          echo "summary<<\${delimiter}" >> $GITHUB_OUTPUT
          echo "### 🚀 GitHub-as-Code Terraform Plan Output" >> $GITHUB_OUTPUT
          echo "> **Branch**: \\\`\${{ github.ref_name }}\\\` | **Commit**: \\\`\${{ github.sha }}\\\`" >> $GITHUB_OUTPUT
          echo "" >> $GITHUB_OUTPUT
          echo "<details><summary>Click to view complete plan</summary>" >> $GITHUB_OUTPUT
          echo "" >> $GITHUB_OUTPUT
          echo '\`\`\`hcl' >> $GITHUB_OUTPUT
          echo "$PLAN_CONTENT" >> $GITHUB_OUTPUT
          echo '\`\`\`' >> $GITHUB_OUTPUT
          echo "</details>" >> $GITHUB_OUTPUT
          echo "\${delimiter}" >> $GITHUB_OUTPUT

      - name: 'Publish Plan to Task Summary'
        env:
          SUMMARY: \${{ steps.plan-summary.outputs.summary }}
        run: |
          echo "$SUMMARY" >> $GITHUB_STEP_SUMMARY

      - name: 'Push Plan Output to Pull Request'
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        env:
          SUMMARY: \${{ steps.plan-summary.outputs.summary }}
        with:
          github-token: \${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
          script: |
            const body = process.env.SUMMARY;
            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });

      - name: 'Archive Terraform Plan Artifact'
        uses: actions/upload-artifact@v4
        with:
          name: gac-tfplan
          path: githubascode/tfplan
          retention-days: 7
          if-no-files-found: error

  terraform-apply:
    name: 'Terraform Apply (Requires Approval)'
    needs: [terraform-test-and-plan]
    if: github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')
    runs-on: ubuntu-latest
    # GitHub Environment protection rule pauses execution and waits for designated approvers to approve
    environment: production
    defaults:
      run:
        working-directory: githubascode

    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v4

      - name: 'Setup Terraform CLI'
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.9.0
          terraform_wrapper: false

      - name: 'Azure CLI Login (OIDC Passwordless)'
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: 'Download Planned Artifact'
        uses: actions/download-artifact@v4
        with:
          name: gac-tfplan
          path: githubascode

      - name: 'Terraform Init (Azure Storage State Backend)'
        run: terraform init

      - name: 'Terraform Apply Approved Plan'
        id: apply
        run: |
          echo "Approver review completed. Applying pre-computed plan..."
          terraform apply -auto-approve tfplan

      - name: 'Publish Apply Report to Summary'
        if: always()
        run: |
          cat << 'EOF' >> $GITHUB_STEP_SUMMARY
          ## ✅ GitHub-as-Code Terraform Apply Completed

          - **Environment**: \\\`production\\\` (Approved by designated gatekeepers)
          - **Trigger**: \\\`\${{ github.event_name }}\\\` on \\\`\${{ github.ref_name }}\\\`
          - **Commit**: \\\`\${{ github.sha }}\\\`
          - **Status**: Finished applying verified Terraform plan.
          EOF
`,
    'tests/repository_validation.tftest.hcl': `# /githubascode/tests/repository_validation.tftest.hcl
# Native Terraform 1.6+ Unit & Integration Test Suite
# Executed via \`terraform test\` in the CI/CD pipeline

run "verify_repositories_catalog_loaded" {
  command = plan

  assert {
    condition     = length(local.active_repositories) > 0
    error_message = "Active repositories catalog must contain at least one repository."
  }

  assert {
    condition     = contains(keys(local.active_repositories), "corp-platform-foundation")
    error_message = "corp-platform-foundation must exist in active repositories."
  }

  assert {
    condition     = contains(keys(local.active_repositories), "corp-billing-api")
    error_message = "corp-billing-api must exist in active repositories."
  }
}
`,
  };

  const handleCopy = (filename: string) => {
    navigator.clipboard.writeText(filesContent[filename]);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = (filename: string) => {
    const content = filesContent[filename];
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop() || filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddRepo = () => {
    if (!newRepo.name) return;
    setRepos([...repos, newRepo]);
    setShowAddModal(false);
  };

  const handleDeleteRepo = (name: string) => {
    setRepos(repos.filter((r) => r.name !== name));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <FolderGit2 className="w-4 h-4" />
              GitHub-as-Code Enterprise Governance (Platform & Application Repositories)
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Per-Repo Approver Gates, dev Protection & Autonomous CI/CD Pipelines
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl leading-relaxed">
              Enforces <strong>no direct commits to dev</strong>, requires <strong>designated per-repository approvers</strong> for prod from <strong>repositories.json</strong>, provisions <strong>dev, qa, cae, prod</strong> with dedicated Azure OIDC, and leaves <strong>status checks flexible</strong> for each repo's unique pipeline.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-mono">
              <span className="bg-rose-950/60 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded">
                ✓ dev Direct Commits Blocked
              </span>
              <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded">
                ✓ Per-Repo Prod Approvers
              </span>
              <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded">
                ✓ Status Checks Decoupled
              </span>
              <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded">
                ✓ 4 Envs: dev, qa, cae, prod
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Another Repository
          </button>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Repositories ({repos.length})
          </button>
          <button
            onClick={() => setFilterType('application')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'application'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Application Repos (dev + prod) ({repos.filter((r) => r.type === 'application').length})
          </button>
          <button
            onClick={() => setFilterType('platform')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'platform'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Platform Repos (prod only) ({repos.filter((r) => r.type === 'platform').length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          Showing {filteredRepos.length} configured repositories
        </div>
      </div>

      {/* Repositories Visual Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => {
          const isApp = repo.type === 'application';
          const envNames = Object.keys(repo.environments);

          return (
            <div
              key={repo.name}
              className={`p-4 rounded-xl bg-slate-900 border flex flex-col justify-between space-y-3 transition-colors ${
                isApp ? 'border-indigo-900/40 hover:border-indigo-700/60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300">{repo.name}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-semibold ${
                        isApp
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {repo.type}
                    </span>
                  </div>
                  {repos.length > 1 && (
                    <button
                      onClick={() => handleDeleteRepo(repo.name)}
                      className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                      title="Remove repository"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">{repo.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                {/* Protected Branches */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1 font-mono text-[10px]">
                    <GitBranch className="w-3 h-3 text-cyan-400" />
                    Protected Branches:
                  </span>
                  <div className="flex items-center gap-1">
                    {repo.protectedBranches.map((b) => (
                      <span
                        key={b}
                        className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[10px] text-cyan-300 border border-slate-800"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prod Approver Gate */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1 font-mono text-[10px]">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Prod Approver:
                  </span>
                  <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono text-[10px]">
                    {repo.prodApprovers?.[0]?.email || 'seniorguy@gmail.com'}
                  </span>
                </div>

                {/* Pipeline Status Checks Policy */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Status Checks:</span>
                  <span className="text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/60 px-1.5 py-0.2 rounded text-[9px]">
                    Autonomous (Per Repo)
                  </span>
                </div>

                {/* Provisioned Environments & OIDC Credentials */}
                <div className="space-y-1">
                  <span className="text-slate-500 block font-mono text-[10px]">
                    Environments & OIDC Credentials:
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(repo.environments).map(([envName, envCfg]) => (
                      <div
                        key={envName}
                        className="p-1.5 rounded bg-slate-950/70 border border-slate-800/70 text-[10px] font-mono flex items-center justify-between"
                      >
                        <span
                          className={`font-semibold uppercase px-1 py-0.2 rounded text-[9px] ${
                            envName === 'prod'
                              ? 'text-emerald-400 bg-emerald-950/50'
                              : 'text-amber-400 bg-amber-950/50'
                          }`}
                        >
                          {envName}
                        </span>
                        <span className="text-slate-400 truncate max-w-[160px]" title={envCfg.azureClientId}>
                          SPN: {envCfg.azureClientId.slice(0, 8)}...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Browser & File Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Tree (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between pb-2 border-b border-slate-800">
            <span>/githubascode File Tree</span>
            <span className="text-[10px] text-slate-500 font-mono">Terraform</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] text-slate-500 font-mono px-2 py-1">Decoupled Catalog & Root Config</div>
            {['repositories.json', 'repositories.tf', 'main.tf', 'variables.tf', 'provider.tf', 'outputs.tf', 'terraform.tfvars.example'].map(
              (file) => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors ${
                    selectedFile === file
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileCode className={`w-3.5 h-3.5 ${file === 'repositories.json' ? 'text-amber-400' : 'text-slate-500'}`} />
                    {file}
                  </span>
                  {selectedFile === file && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              )
            )}

            <div className="text-[11px] text-slate-500 font-mono px-2 pt-3 pb-1">
              Reusable Module: modules/repository/
            </div>
            {[
              'modules/repository/main.tf',
              'modules/repository/variables.tf',
              'modules/repository/outputs.tf',
            ].map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors ${
                  selectedFile === file
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  {file.replace('modules/repository/', '')}
                </span>
                {selectedFile === file && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </button>
            ))}

            <div className="text-[11px] text-slate-500 font-mono px-2 pt-3 pb-1">
              CI/CD Pipeline & Tests
            </div>
            {[
              '.github/workflows/gac.yml',
              'tests/repository_validation.tftest.hcl',
            ].map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors ${
                  selectedFile === file
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 ${file.endsWith('.yml') ? 'text-emerald-400' : 'text-amber-400'}`} />
                  {file.replace('.github/workflows/', '')}
                </span>
                {selectedFile === file && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Code Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{selectedFile.startsWith('.') ? selectedFile : `githubascode/${selectedFile}`}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(selectedFile)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {copiedFile === selectedFile ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedFile === selectedFile ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload(selectedFile)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 max-h-[560px] overflow-y-auto whitespace-pre leading-relaxed shadow-xl">
            {filesContent[selectedFile]}
          </div>
        </div>
      </div>

      {/* Add Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Add Repository (Platform or Application)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Repository Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewRepo({
                        ...newRepo,
                        type: 'application',
                        protectedBranches: ['main', 'dev'],
                      })
                    }
                    className={`py-2 px-3 rounded-lg border text-left font-medium transition-colors ${
                      newRepo.type === 'application'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Application Repo</div>
                    <div className="text-[10px] text-slate-500">dev + prod envs, main + dev branches</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setNewRepo({
                        ...newRepo,
                        type: 'platform',
                        protectedBranches: ['main'],
                      })
                    }
                    className={`py-2 px-3 rounded-lg border text-left font-medium transition-colors ${
                      newRepo.type === 'platform'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Platform Repo</div>
                    <div className="text-[10px] text-slate-500">prod only, main branch</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Repository Name</label>
                <input
                  type="text"
                  value={newRepo.name}
                  onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  placeholder="corp-billing-api"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Description</label>
                <input
                  type="text"
                  value={newRepo.description}
                  onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Prod Approver Email</label>
                  <input
                    type="email"
                    value={newRepo.prodApprovers?.[0]?.email || ''}
                    onChange={(e) =>
                      setNewRepo({
                        ...newRepo,
                        prodApprovers: [
                          {
                            email: e.target.value,
                            username: newRepo.prodApprovers?.[0]?.username || e.target.value.split('@')[0],
                          },
                        ],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
                    placeholder="lead@company.com"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Prod Approver GitHub User</label>
                  <input
                    type="text"
                    value={newRepo.prodApprovers?.[0]?.username || ''}
                    onChange={(e) =>
                      setNewRepo({
                        ...newRepo,
                        prodApprovers: [
                          {
                            email: newRepo.prodApprovers?.[0]?.email || `${e.target.value}@gmail.com`,
                            username: e.target.value,
                          },
                        ],
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
                    placeholder="leaduser"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Dev Azure Client ID</label>
                  <input
                    type="text"
                    value={newRepo.environments.dev?.azureClientId || ''}
                    onChange={(e) =>
                      setNewRepo({
                        ...newRepo,
                        environments: {
                          ...newRepo.environments,
                          dev: {
                            ...(newRepo.environments.dev || {
                              azureTenantId: '88888888-4444-4444-4444-121212121212',
                              azureSubscriptionId: '30000000-0000-0000-0000-000000000001',
                            }),
                            azureClientId: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Prod Azure Client ID</label>
                  <input
                    type="text"
                    value={newRepo.environments.prod?.azureClientId || ''}
                    onChange={(e) =>
                      setNewRepo({
                        ...newRepo,
                        environments: {
                          ...newRepo.environments,
                          prod: {
                            ...(newRepo.environments.prod || {
                              azureTenantId: '88888888-4444-4444-4444-121212121212',
                              azureSubscriptionId: '40000000-0000-0000-0000-000000000001',
                            }),
                            azureClientId: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRepo}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Add Repository
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
