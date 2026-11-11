# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: SCALABLE ENTERPRISE PLATFORM & APPLICATION REPOSITORIES ORCHESTRATION
# ---------------------------------------------------------------------------------------------------------------------
# 1. Loads repository definitions from the decoupled /githubascode/repositories.json catalog
# 2. Blocks direct commits to both 'main' and 'develop' (enforces Pull Requests & Code Owners)
# 3. Requires designated per-repository reviewer approvals for the 'prod' deployment environment
# 4. Provisions 4 isolated environments: 'dev', 'qa', 'cae', and 'prod', each with dedicated Azure OIDC credentials
# 5. Pipeline status checks are decoupled to allow each repository to define its own CI/CD workflow
# ---------------------------------------------------------------------------------------------------------------------

locals {
  # Collect all unique usernames of designated approvers across all repositories in the catalog
  all_prod_approver_usernames = distinct(flatten([
    for repo in local.active_repositories : [
      for approver in try(repo.prod_approvers, []) : approver.username if try(approver.username, "") != ""
    ]
  ]))
}

# Dynamically look up GitHub numeric user IDs for each unique approver
data "github_user" "approvers" {
  for_each = toset(local.all_prod_approver_usernames)
  username = each.value
}

locals {
  # Map username to resolved GitHub numeric user ID
  approver_username_to_id = {
    for username, user in data.github_user.approvers : username => user.id
  }
}

module "repositories" {
  source   = "./modules/repository"
  for_each = local.active_repositories

  name        = each.key
  description = each.value.description
  visibility  = coalesce(each.value.visibility, "private")
  topics      = coalesce(each.value.topics, ["terraform"])

  # 1. Multi-Branch Protection: Direct commits to 'main' & 'dev' are strictly BLOCKED
  # (Status checks omitted so each repository can freely execute its own custom pipeline)
  default_branch             = "main"
  protected_branches         = coalesce(each.value.protected_branches, ["main", "dev"])
  enforce_admins             = true
  required_approvals         = coalesce(each.value.required_approvals, 1)
  dismiss_stale_reviews      = true
  require_code_owner_reviews = true

  # 2. Multi-Environment & Dedicated Azure OIDC Credentials ('dev', 'qa', 'cae', 'prod')
  environments = each.value.environments

  # 3. Per-Repository Designated Approvers for 'prod' environment
  prod_reviewer_ids = flatten([
    for approver in try(each.value.prod_approvers, []) :
    contains(keys(local.approver_username_to_id), try(approver.username, "")) ? [local.approver_username_to_id[approver.username]] : []
  ])
}