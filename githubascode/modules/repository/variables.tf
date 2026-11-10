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
  default     = ["terraform", "azure-platform"]
}

# Branch Protection Variables
variable "target_branch" {
  description = "Default branch name to protect."
  type        = string
  default     = "main"
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

# Environment & Azure OIDC Secrets
variable "environment_name" {
  description = "Target GitHub environment name to create."
  type        = string
  default     = "prod"
}

variable "azure_client_id" {
  description = "Dedicated Azure Client (Application) ID for this repository's OIDC federation."
  type        = string
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "Azure Active Directory / Entra Tenant ID for this repository."
  type        = string
  sensitive   = true
}

variable "azure_subscription_id" {
  description = "Dedicated Azure Subscription ID scoped to this platform domain."
  type        = string
  sensitive   = true
}
