# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: DECOUPLED REPOSITORIES CATALOG LOADER (SCALABLE TO HUNDREDS OF REPOS)
# ---------------------------------------------------------------------------------------------------------------------
# Instead of hardcoding hundreds of repositories in Terraform files, this file dynamically loads
# and parses the external /githubascode/repositories.json catalog.
#
# To onboard a new repository, teams simply add a JSON record into repositories.json.
# ---------------------------------------------------------------------------------------------------------------------

locals {
  # 1. Load the decoupled catalog file
  raw_catalog = jsondecode(file("\${path.module}/repositories.json"))

  # 2. Normalize and index repositories by name
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

  # 3. Active repository list (prioritizes var.repositories override if specified, otherwise uses repositories.json)
  active_repositories = length(var.repositories) > 0 ? var.repositories : local.repositories_catalog
}
