# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: ENTERPRISE PLATFORM REPOSITORIES & AZURE OIDC FEDERATION
# ---------------------------------------------------------------------------------------------------------------------
# This configuration creates the platform engineering repositories, enforces strict branch protection
# on 'main', provisions the 'prod' deployment environment, and injects dedicated Azure OIDC credentials
# into each repository's environment secrets.
# ---------------------------------------------------------------------------------------------------------------------

module "platform_repositories" {
  source   = "./modules/repository"
  for_each = var.repositories

  name                   = each.key
  description            = each.value.description
  visibility             = coalesce(each.value.visibility, "private")
  topics                 = coalesce(each.value.topics, ["terraform", "azure-platform"])

  # 1. Strict Branch Protection Policy
  target_branch          = "main"
  enforce_admins         = true
  required_approvals     = coalesce(each.value.required_approvals, 1)
  dismiss_stale_reviews  = true
  require_code_owner_reviews = true
  status_checks          = coalesce(each.value.status_checks, ["Terraform Unit Tests", "Terraform Plan"])

  # 2. Dedicated GitHub Environment
  environment_name       = "prod"

  # 3. Dedicated Azure OIDC Credentials per repository
  azure_client_id        = each.value.azure_client_id
  azure_tenant_id        = each.value.azure_tenant_id
  azure_subscription_id = each.value.azure_subscription_id
}