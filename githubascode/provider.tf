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

  terraform {
    backend "azurerm" {
      resource_group_name  = "rg-tfstate-prod"
      storage_account_name = "sttfstateplatformasgithubprod"
      container_name       = "tfstate"
      key                  = "corpplatformasgithub.tfstate"
      use_oidc             = true
    }
  }
}

provider "github" {
  owner = var.github_owner
}

provider "azurerm" {
  features {}
  use_oidc = true
}