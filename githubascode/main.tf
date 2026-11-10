# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: PLATFORM & APPLICATION REPOSITORIES ORCHESTRATION
# ---------------------------------------------------------------------------------------------------------------------
# Instantiates module.repository for each repository:
# - Supports both single-branch/prod platform repos AND dual-branch (main, dev) / dual-env (dev, prod) app repos.
# - Enforces strict branch protection across all configured protected branches.
# - Injects dedicated Azure OIDC credentials into each repository's corresponding environment secrets.
# ---------------------------------------------------------------------------------------------------------------------

module "repositories" {
  source   = "./modules/repository"
  for_each = var.repositories

  name                   = each.key
  description            = each.value.description
  visibility             = coalesce(each.value.visibility, "private")
  topics                 = coalesce(each.value.topics, ["terraform"])

  # 1. Multi-Branch Protection ('main', 'dev', etc.)
  default_branch         = "main"
  protected_branches     = coalesce(each.value.protected_branches, ["main"])
  enforce_admins         = true
  required_approvals     = coalesce(each.value.required_approvals, 1)
  dismiss_stale_reviews  = true
  require_code_owner_reviews = true
  status_checks          = coalesce(each.value.status_checks, ["Terraform Unit Tests", "Terraform Plan"])

  # 2. Multi-Environment & Dedicated Azure OIDC Credentials ('dev', 'prod')
  environments           = each.value.environments
}