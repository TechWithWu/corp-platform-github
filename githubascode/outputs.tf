output "repository_urls" {
  description = "Map of created repository names to their GitHub HTML URLs."
  value = {
    for name, repo in module.repositories : name => repo.html_url
  }
}

output "provisioned_environments" {
  description = "Map of repository names to their provisioned deployment environments."
  value = {
    for name, repo in module.repositories : name => repo.environments
  }
}

output "protected_branches" {
  description = "Map of repository names to their protected branch patterns."
  value = {
    for name, repo in module.repositories : name => repo.protected_branches
  }
}

output "security_audit_summary" {
  description = "Audit summary of security protections, environments, and OIDC secrets provisioned per repository."
  value = {
    for name, config in var.repositories : name => {
      protected_branches = coalesce(config.protected_branches, ["main"])
      environments       = keys(config.environments)
      oidc_credentials = {
        for env_name, env_cfg in config.environments : env_name => {
          client_id_configured = env_cfg.azure_client_id != ""
          tenant_id_configured = env_cfg.azure_tenant_id != ""
          subscription_id_configured = env_cfg.azure_subscription_id != ""
        }
      }
    }
  }
}
