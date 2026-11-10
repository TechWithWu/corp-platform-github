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
  auto_init              = true # Initializes repository with default README.md
  has_issues             = true
  has_projects           = false
  has_wiki               = false
  delete_branch_on_merge = true
  allow_merge_commit     = false
  allow_squash_merge     = true
  allow_rebase_merge     = false
  topics                 = var.topics
}

# 2. Configure Strict Branch Protection Rules for 'main' branch
resource "github_branch_protection" "main" {
  repository_id                   = github_repository.this.name
  pattern                         = var.target_branch
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

  required_status_checks {
    strict   = true
    contexts = var.status_checks
  }

  depends_on = [github_repository.this]
}

# 3. Create Target Environment (e.g., 'prod')
resource "github_repository_environment" "prod" {
  repository        = github_repository.this.name
  environment       = var.environment_name
  can_admins_bypass = true

  depends_on = [github_repository.this]
}

# 4. Inject Dedicated Azure OIDC Client ID into 'prod' Environment Secret
resource "github_actions_environment_secret" "azure_client_id" {
  count           = var.azure_client_id != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AZURE_CLIENT_ID"
  plaintext_value = var.azure_client_id
}

# 5. Inject Dedicated Azure OIDC Tenant ID into 'prod' Environment Secret
resource "github_actions_environment_secret" "azure_tenant_id" {
  count           = var.azure_tenant_id != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AZURE_TENANT_ID"
  plaintext_value = var.azure_tenant_id
}

# 6. Inject Dedicated Azure OIDC Subscription ID into 'prod' Environment Secret
resource "github_actions_environment_secret" "azure_subscription_id" {
  count           = var.azure_subscription_id != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AZURE_SUBSCRIPTION_ID"
  plaintext_value = var.azure_subscription_id
}
