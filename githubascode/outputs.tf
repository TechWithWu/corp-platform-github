output "total_repositories_count" {
  description = "Total number of repositories provisioned from the catalog."
  value       = length(module.repositories)
}

output "repository_urls" {
  description = "Map of created repository names to their GitHub HTML URLs."
  value = {
    for name, repo in module.repositories : name => repo.html_url
  }
}

output "provisioned_environments" {
  description = "Map of repository names to their provisioned deployment environments ('dev', 'qa', 'cae', 'prod')."
  value = {
    for name, repo in module.repositories : name => repo.environments
  }
}

output "protected_branches" {
  description = "Map of repository names to their protected branch patterns ('main', 'dev')."
  value = {
    for name, repo in module.repositories : name => repo.protected_branches
  }
}

output "prod_approval_gate" {
  description = "Designated reviewer gate enforced on all 'prod' deployment environments."
  value = {
    approver_email    = var.prod_approver_email
    approver_username = var.prod_approver_username
    policy            = "Required approval before production deployment. Administrators cannot bypass."
  }
}
