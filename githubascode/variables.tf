# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: ROOT VARIABLES & ENTERPRISE GOVERNANCE POLICIES
# ---------------------------------------------------------------------------------------------------------------------
# Note: provider "github" {} automatically reads temporary runner variables:
#   GITHUB_TOKEN = ${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
#   GITHUB_OWNER = ${{ github.repository_owner }}
# ---------------------------------------------------------------------------------------------------------------------

variable "prod_approver_email" {
  description = "Email of the designated approver for the 'prod' deployment environment."
  type        = string
  default     = "seniorguy@gmail.com"
}

variable "prod_approver_username" {
  description = "GitHub username corresponding to the designated approver (seniorguy@gmail.com)."
  type        = string
  default     = "seniorguy"
}

variable "prod_approver_user_id" {
  description = "Optional direct GitHub numeric user ID for the approver. If set, bypasses data lookup."
  type        = number
  default     = null
}

variable "repositories" {
  description = "Optional override map of repositories. If left empty ({}), Terraform automatically loads the decoupled /githubascode/repositories.json catalog, enabling scalable management of hundreds of repositories."
  type = map(object({
    description        = string
    visibility         = optional(string, "private")
    protected_branches = optional(list(string), ["main", "dev"])
    topics             = optional(list(string), ["terraform"])
    required_approvals = optional(number, 1)
    status_checks      = optional(list(string), ["Terraform Unit Tests", "Terraform Plan"])
    environments       = map(object({
      azure_client_id       = string
      azure_tenant_id       = string
      azure_subscription_id = string
    }))
  }))
  default = {}
}
