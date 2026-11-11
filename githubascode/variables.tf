# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: ROOT VARIABLES & ENTERPRISE GOVERNANCE POLICIES
# ---------------------------------------------------------------------------------------------------------------------
# Note: provider "github" {} automatically reads temporary runner variables:
#   GITHUB_TOKEN = ${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
#   GITHUB_OWNER = ${{ github.repository_owner }}
#
# Production environment approvers are decoupled into /githubascode/repositories.json
# because approvers differ across repositories. Status checks are omitted from branch
# protection to allow each repository to define its own pipeline.
# ---------------------------------------------------------------------------------------------------------------------

variable "repositories" {
  description = "Optional override map of repositories. If left empty ({}), Terraform automatically loads the decoupled /githubascode/repositories.json catalog, enabling scalable management of hundreds of repositories."
  type = map(object({
    description        = string
    visibility         = optional(string, "private")
    protected_branches = optional(list(string), ["main", "dev"])
    topics             = optional(list(string), ["terraform"])
    required_approvals = optional(number, 1)
    prod_approvers = optional(list(object({
      email    = string
      username = string
    })), [])
    environments = map(object({
      azure_client_id       = string
      azure_tenant_id       = string
      azure_subscription_id = string
    }))
  }))
  default = {}
}
