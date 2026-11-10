variable "name" {
  description = "The name of the GitHub repository."
  type        = string
}

variable "description" {
  description = "A description of the GitHub repository."
  type        = string
  default     = ""
}

variable "visibility" {
  description = "Visibility of the repository (public or private)."
  type        = string
  default     = "private"
}

variable "topics" {
  description = "List of topics/tags to apply to the repository."
  type        = list(string)
  default     = ["terraform"]
}

# Branch & Protection Settings
variable "default_branch" {
  description = "Default repository branch."
  type        = string
  default     = "main"
}

variable "protected_branches" {
  description = "List of branch names that must be created and protected (e.g. ['main', 'dev'] for application repos, or ['main'] for platform repos)."
  type        = list(string)
  default     = ["main"]
}

variable "enforce_admins" {
  description = "Enforce branch protection rules on repository administrators."
  type        = bool
  default     = true
}

variable "required_approvals" {
  description = "Number of required approving pull request reviews."
  type        = number
  default     = 1
}

variable "dismiss_stale_reviews" {
  description = "Dismiss approving reviews when new commits are pushed."
  type        = bool
  default     = true
}

variable "require_code_owner_reviews" {
  description = "Require review from Code Owners."
  type        = bool
  default     = true
}

variable "status_checks" {
  description = "List of required status check contexts that must pass before merging."
  type        = list(string)
  default     = ["Terraform Unit Tests", "Terraform Plan"]
}

# Multi-Environment & Dedicated Azure OIDC Credentials
variable "environments" {
  description = "Map of environments to provision (e.g., 'prod', 'dev') with dedicated Azure OIDC credentials."
  type = map(object({
    azure_client_id       = string
    azure_tenant_id       = string
    azure_subscription_id = string
  }))
  default = {
    "prod" = {
      azure_client_id       = ""
      azure_tenant_id       = ""
      azure_subscription_id = ""
    }
  }
}
