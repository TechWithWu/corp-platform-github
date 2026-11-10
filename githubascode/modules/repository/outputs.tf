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

output "environment_name" {
  description = "The configured environment name."
  value       = github_repository_environment.prod.environment
}

output "branch_protection_id" {
  description = "ID of the branch protection configuration."
  value       = github_branch_protection.main.id
}
