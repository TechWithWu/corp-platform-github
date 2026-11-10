terraform {
  required_version = ">= 1.5.0"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

# The GitHub provider automatically discovers authentication and target scope from standard
# temporary environment variables without hardcoded inputs or variable declarations:
# - GITHUB_TOKEN : Built-in runner token (${{ secrets.GITHUB_TOKEN }} or ${{ secrets.ADMIN_GITHUB_TOKEN }})
# - GITHUB_OWNER : Built-in organization/owner context (${{ github.repository_owner }})
provider "github" {}