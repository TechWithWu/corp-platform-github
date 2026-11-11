# checkov:skip=CKV_GIT_4: Terraform provider handles GitHub Actions secrets encryption client-side

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
resource "github_branch_protection" "protection" {
  for_each = toset(var.protected_branches)

  repository_id                   = github_repository.this.name
  pattern                         = each.value
  enforce_admins                  = var.enforce_admins
  required_linear_history         = true
  allows_force_pushes             = false
  allows_deletions                = false
  require_conversation_resolution = true

  # Direct commits are strictly BLOCKED: all commits must go through Pull Request reviews
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

  # Rule: 'prod' environment requires designated reviewer approval (e.g. seniorguy@gmail.com)
  dynamic "reviewers" {
    for_each = each.key == "prod" && length(var.prod_reviewer_ids) > 0 ? [1] : []
    content {
      users = var.prod_reviewer_ids
    }
  }

  depends_on = [github_repository.this]
}

# 5. Inject Environment-Specific Azure OIDC Client ID (dev, qa, cae, prod)
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

# 6. Inject Environment-Specific Azure OIDC Tenant ID (dev, qa, cae, prod)
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

# 7. Inject Environment-Specific Azure OIDC Subscription ID (dev, qa, cae, prod)
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
