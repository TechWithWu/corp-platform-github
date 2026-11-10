output "repository_urls" {
  description = "Map of created repository names to their GitHub HTML URLs."
  value = {
    for name, repo in module.platform_repositories : name => repo.html_url
  }
}

output "git_clone_urls" {
  description = "Map of created repository names to their Git clone URLs."
  value = {
    for name, repo in module.platform_repositories : name => repo.git_clone_url
  }
}

output "provisioned_environments" {
  description = "The target deployment environment provisioned per repository."
  value = {
    for name, repo in module.platform_repositories : name => repo.environment_name
  }
}

output "security_audit_summary" {
  description = "Audit summary of security protections and OIDC secrets provisioned."
  value = {
    for name, config in var.repositories : name => {
      branch_protection     = "Enforced on 'main' (Admins strictly enforced, linear history required)"
      required_reviews      = config.required_approvals
      environment           = "prod"
      azure_client_id_set   = config.azure_client_id != ""
      azure_tenant_id_set   = config.azure_tenant_id != ""
      azure_subscription_set = config.azure_subscription_id != ""
    }
  }
}
