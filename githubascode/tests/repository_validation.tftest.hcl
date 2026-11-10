# Native Terraform 1.6+ Unit & Integration Test Suite
# Executed via `terraform test` in the CI/CD pipeline

run "verify_repositories_catalog_loaded" {
  command = plan

  assert {
    condition     = length(local.active_repositories) > 0
    error_message = "Active repositories catalog must contain at least one repository."
  }

  assert {
    condition     = contains(keys(local.active_repositories), "corp-platform-foundation")
    error_message = "corp-platform-foundation must exist in active repositories."
  }

  assert {
    condition     = contains(keys(local.active_repositories), "corp-billing-api")
    error_message = "corp-billing-api must exist in active repositories."
  }
}
