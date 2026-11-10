# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: PLATFORM & APPLICATION REPOSITORIES CONFIGURATION
# ---------------------------------------------------------------------------------------------------------------------
# Supports both:
# 1. Platform Repositories (e.g. corp-platform-foundation):
#    - single 'main' protected branch
#    - single 'prod' environment
# 2. Application Repositories (e.g. corp-billing-api, corp-billing-web, corp-products-api):
#    - dual protected branches: ['main', 'dev']
#    - dual environments: ['dev', 'prod'] each with isolated Azure OIDC SPN credentials
#
# Note: provider "github" {} automatically reads temporary runner variables:
#   GITHUB_TOKEN = ${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
#   GITHUB_OWNER = ${{ github.repository_owner }}
# ---------------------------------------------------------------------------------------------------------------------

variable "repositories" {
  description = "Map of all repositories to provision with their branch protection rules and environment-specific Azure OIDC credentials."
  type = map(object({
    description        = string
    visibility         = optional(string, "private")
    protected_branches = optional(list(string), ["main"])
    topics             = optional(list(string), ["terraform"])
    required_approvals = optional(number, 1)
    status_checks      = optional(list(string), ["Terraform Unit Tests", "Terraform Plan"])
    environments       = map(object({
      azure_client_id       = string
      azure_tenant_id       = string
      azure_subscription_id = string
    }))
  }))

  default = {
    # =========================================================================
    # A. PLATFORM INFRASTRUCTURE REPOSITORIES
    # =========================================================================
    "corp-platform-foundation" = {
      description        = "Enterprise governance: Management Groups, Azure Policy, RBAC baselines, and subscription vending"
      visibility         = "private"
      protected_branches = ["main"]
      topics             = ["azure", "landing-zone", "management-groups", "policy"]
      required_approvals = 1
      status_checks      = ["Terraform Unit Tests", "Terraform Plan"]
      environments = {
        "prod" = {
          azure_client_id       = "00000000-0000-0000-0000-000000000001"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "22222222-2222-2222-2222-222222222221"
        }
      }
    }

    "corp-platform-management" = {
      description        = "Centralized Ops: Log Analytics, Sentinel, Azure Monitor, and alert policies"
      visibility         = "private"
      protected_branches = ["main"]
      topics             = ["azure", "operations", "sentinel", "monitor"]
      required_approvals = 1
      status_checks      = ["Terraform Unit Tests", "Terraform Plan"]
      environments = {
        "prod" = {
          azure_client_id       = "00000000-0000-0000-0000-000000000002"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "22222222-2222-2222-2222-222222222222"
        }
      }
    }

    "corp-platform-connectivity" = {
      description        = "Centralized Networking: Hub VNet, Azure Firewall, VPN/ExpressRoute, and global NSG rules"
      visibility         = "private"
      protected_branches = ["main"]
      topics             = ["azure", "networking", "firewall", "hub-spoke"]
      required_approvals = 1
      status_checks      = ["Terraform Unit Tests", "Terraform Plan"]
      environments = {
        "prod" = {
          azure_client_id       = "00000000-0000-0000-0000-000000000003"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "22222222-2222-2222-2222-222222222223"
        }
      }
    }

    # =========================================================================
    # B. APPLICATION REPOSITORIES (dev & prod environments, main & dev protected branches)
    # =========================================================================
    "corp-billing-api" = {
      description        = "Billing Microservice API: invoice generation, payment gateways, and usage metering"
      visibility         = "private"
      protected_branches = ["main", "dev"]
      topics             = ["microservice", "billing", "api", "azure-container-apps"]
      required_approvals = 1
      status_checks      = ["CI Build & Unit Tests", "Terraform Security Scan"]
      environments = {
        "dev" = {
          azure_client_id       = "10000000-0000-0000-0000-000000000001"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "30000000-0000-0000-0000-000000000001" # dev workload sub
        }
        "prod" = {
          azure_client_id       = "20000000-0000-0000-0000-000000000001"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "40000000-0000-0000-0000-000000000001" # prod workload sub
        }
      }
    }

    "corp-billing-web" = {
      description        = "Billing Customer Portal: self-service invoicing and billing dashboard frontend"
      visibility         = "private"
      protected_branches = ["main", "dev"]
      topics             = ["frontend", "billing", "react", "azure-static-web-apps"]
      required_approvals = 1
      status_checks      = ["Frontend Lint & Tests", "E2E Smoke Tests"]
      environments = {
        "dev" = {
          azure_client_id       = "10000000-0000-0000-0000-000000000002"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "30000000-0000-0000-0000-000000000001" # dev workload sub
        }
        "prod" = {
          azure_client_id       = "20000000-0000-0000-0000-000000000002"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "40000000-0000-0000-0000-000000000001" # prod workload sub
        }
      }
    }

    "corp-products-api" = {
      description        = "Product Catalog & Pricing Engine: high-performance product queries and pricing rules"
      visibility         = "private"
      protected_branches = ["main", "dev"]
      topics             = ["microservice", "catalog", "products", "api"]
      required_approvals = 1
      status_checks      = ["Unit Tests", "Integration Tests"]
      environments = {
        "dev" = {
          azure_client_id       = "10000000-0000-0000-0000-000000000003"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "30000000-0000-0000-0000-000000000002" # dev workload sub
        }
        "prod" = {
          azure_client_id       = "20000000-0000-0000-0000-000000000003"
          azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
          azure_subscription_id = "40000000-0000-0000-0000-000000000002" # prod workload sub
        }
      }
    }
  }
}
