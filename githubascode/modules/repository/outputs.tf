output "repository_name" {
  description = "Name of the created GitHub repository."
  value       = github_repository.this.name
}

output "html_url" {
  description = "The HTTP URL of the GitHub repository."
  value       = github_repository.this.html_url
}

output "git_clone_url" {
  description = "The Git clone URL of the repository."
  value       = github_repository.this.git_clone_url
}

output "environments" {
  description = "List of provisioned environment names."
  value       = [for e in github_repository_environment.environments : e.environment]
}

output "protected_branches" {
  description = "List of protected branch patterns."
  value       = [for p in github_branch_protection.protection : p.pattern]
}
