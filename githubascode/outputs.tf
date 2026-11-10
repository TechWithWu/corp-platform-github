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

output "prod_approval_gates" {
  description = "Designated reviewer gate enforced on 'prod' deployment environments per repository from repositories.json."
  value = {
    for name, repo in local.active_repositories : name => [
      for approver in try(repo.prod_approvers, []) : "${approver.username} (${approver.email})"
    ]
  }
}

output "pipeline_status_checks_policy" {
  description = "Architecture policy on branch protection status checks."
  value       = "Status checks are decoupled from branch protection so each repository can execute its own distinct CI/CD pipeline without Terraform coupling."
}
