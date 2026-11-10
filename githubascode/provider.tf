terraform {
  required_version = ">= 1.5.0"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
  }

  # Azure Storage Account Remote State Backend
  # Stores the Terraform state file securely with state locking in an Azure Blob Storage container.
  # Leverages Azure Workload Identity / OIDC (use_oidc = true) via ARM_* environment variables
  # passed by GitHub Actions without requiring long-lived storage account access keys.
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state-prod"
    storage_account_name = "stcorpghasstateprod"
    container_name       = "tfstate"
    key                  = "githubascode.tfstate"
    use_oidc             = true
  }
}

# The GitHub provider automatically discovers authentication and target scope from standard
# environment variables without hardcoded inputs or variable declarations:
# - GITHUB_TOKEN : Built-in runner token (${{ secrets.GITHUB_TOKEN }} or ${{ secrets.ADMIN_GITHUB_TOKEN }})
# - GITHUB_OWNER : Built-in organization/owner context (${{ github.repository_owner }})
provider "github" {}

# Optional AzureRM provider for supplemental Azure resource operations using OIDC
provider "azurerm" {
  features {}
  use_oidc = true
}