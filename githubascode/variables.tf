# ---------------------------------------------------------------------------------------------------------------------
# GITHUB-AS-CODE: PLATFORM REPOSITORIES & AZURE OIDC CREDENTIALS
# ---------------------------------------------------------------------------------------------------------------------
# Note: github_token and github_owner are NOT declared as variables here.
# The official GitHub Terraform provider natively reads the default temporary runner environment variables:
# - GITHUB_TOKEN (automatic temporary token in runner: ${{ secrets.GITHUB_TOKEN }})
# - GITHUB_OWNER (automatic runner owner context: ${{ github.repository_owner }})
# ---------------------------------------------------------------------------------------------------------------------

variable "repositories" {
  description = "Map of platform repositories to provision, each with dedicated Azure OIDC credentials, branch protection, and prod environment."
  type = map(object({
    description           = string
    visibility            = optional(string, "private")
    azure_client_id       = string
    azure_tenant_id       = string
    azure_subscription_id = string
    required_approvals    = optional(number, 1)
    status_checks         = optional(list(string), ["Terraform Unit Tests", "Terraform Plan"])
    topics                = optional(list(string), ["terraform", "azure-landing-zone"])
  }))

  default = {
    # 1. Foundation: Management Groups, Azure Policy, RBAC Baselines, Subscription Vending
    "corp-platform-foundation" = {
      description           = "Enterprise governance: Management Groups, Azure Policy, RBAC baselines, and subscription vending"
      visibility            = "private"
      azure_client_id       = "00000000-0000-0000-0000-000000000001"
      azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
      azure_subscription_id = "22222222-2222-2222-2222-222222222221"
      required_approvals    = 1
      status_checks         = ["Terraform Unit Tests", "Terraform Plan"]
      topics                = ["azure", "landing-zone", "management-groups", "policy", "governance"]
    }

    # 2. Management: Centralized Logging, Sentinel SIEM, Azure Monitor, Alerting
    "corp-platform-management" = {
      description           = "Centralized Ops: Log Analytics, Sentinel, Azure Monitor, and alert policies"
      visibility            = "private"
      azure_client_id       = "00000000-0000-0000-0000-000000000002"
      azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
      azure_subscription_id = "22222222-2222-2222-2222-222222222222"
      required_approvals    = 1
      status_checks         = ["Terraform Unit Tests", "Terraform Plan"]
      topics                = ["azure", "operations", "sentinel", "monitor", "log-analytics"]
    }

    # 3. Connectivity: Hub Virtual Network, Azure Firewall, ExpressRoute, VPN, Routing
    "corp-platform-connectivity" = {
      description           = "Centralized Networking: Hub VNet, Azure Firewall, VPN/ExpressRoute, and global NSG rules"
      visibility            = "private"
      azure_client_id       = "00000000-0000-0000-0000-000000000003"
      azure_tenant_id       = "11111111-1111-1111-1111-111111111111"
      azure_subscription_id = "22222222-2222-2222-2222-222222222223"
      required_approvals    = 1
      status_checks         = ["Terraform Unit Tests", "Terraform Plan"]
      topics                = ["azure", "networking", "firewall", "hub-spoke", "expressroute"]
    }
  }
}
