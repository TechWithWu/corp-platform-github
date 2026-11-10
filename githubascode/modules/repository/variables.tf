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
  description = "List of branch names that must be created and protected (e.g. ['main', 'dev']). Direct commits to these branches will be rejected; all changes must arrive via approved Pull Requests."
  type        = list(string)
  default     = ["main", "dev"]
}

variable "enforce_admins" {
  description = "Enforce branch protection rules on repository administrators (no bypass)."
  type        = bool
  default     = true
}

variable "required_approvals" {
  description = "Number of required approving pull request reviews before merging."
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

# Environments & Approvers
variable "prod_reviewer_ids" {
  description = "List of GitHub User IDs required to approve deployments targeting the 'prod' environment (e.g., seniorguy@gmail.com)."
  type        = list(number)
  default     = []
}

variable "environments" {
  description = "Map of environments to provision (e.g., 'dev', 'qa', 'cae', 'prod') with dedicated Azure OIDC credentials."
  type = map(object({
    azure_client_id       = string
    azure_tenant_id       = string
    azure_subscription_id = string
  }))
}
