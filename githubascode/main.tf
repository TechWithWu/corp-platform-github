# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: SCALABLE ENTERPRISE PLATFORM & APPLICATION REPOSITORIES ORCHESTRATION
# ---------------------------------------------------------------------------------------------------------------------
# 1. Loads repository definitions from the decoupled /githubascode/repositories.json catalog
# 2. Blocks direct commits to both 'main' and 'dev' (enforces Pull Requests & Code Owners)
# 3. Requires designated reviewer approval (seniorguy@gmail.com) for the 'prod' deployment environment
# 4. Provisions 4 isolated environments: 'dev', 'qa', 'cae', and 'prod', each with dedicated Azure OIDC credentials
# ---------------------------------------------------------------------------------------------------------------------

# Look up GitHub user ID for the designated reviewer (seniorguy@gmail.com)
data "github_user" "approver" {
  count    = var.prod_approver_user_id == null && var.prod_approver_username != "" ? 1 : 0
  username = var.prod_approver_username
}

locals {
  resolved_reviewer_ids = var.prod_approver_user_id != null ? [var.prod_approver_user_id] : (
    length(data.github_user.approver) > 0 ? [data.github_user.approver[0].id] : []
  )
}

module "repositories" {
  source   = "./modules/repository"
  for_each = local.active_repositories

  name                   = each.key
  description            = each.value.description
  visibility             = coalesce(each.value.visibility, "private")
  topics                 = coalesce(each.value.topics, ["terraform"])

  # 1. Multi-Branch Protection: Direct commits to 'main' & 'dev' are strictly BLOCKED
  default_branch         = "main"
  protected_branches     = coalesce(each.value.protected_branches, ["main", "dev"])
  enforce_admins         = true
  required_approvals     = coalesce(each.value.required_approvals, 1)
  dismiss_stale_reviews  = true
  require_code_owner_reviews = true
  status_checks          = coalesce(each.value.status_checks, ["Terraform Unit Tests", "Terraform Plan"])

  # 2. Multi-Environment & Dedicated Azure OIDC Credentials ('dev', 'qa', 'cae', 'prod')
  environments           = each.value.environments

  # 3. Designated Approver for 'prod' environment (seniorguy@gmail.com)
  prod_reviewer_ids      = local.resolved_reviewer_ids
}