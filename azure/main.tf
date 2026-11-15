terraform {
  required_version = ">= 1.7"

  required_providers {
    azuread = { source = "hashicorp/azuread",   version = "~> 3.0" }
    azurerm = { source = "hashicorp/azurerm",   version = "~> 4.0" }
    github  = { source = "integrations/github", version = "~> 6.0" }
    time    = { source = "hashicorp/time",      version = "~> 0.12" }
  }

  # Interview bonus: remote state
  # backend "azurerm" {
  #   resource_group_name  = "rg-tfstate-prod"
  #   storage_account_name = "sttfstate<yourname>"
  #   container_name       = "tfstate"
  #   key                  = "azure-oidc-bootstrap.tfstate"
  # }
}

provider "azuread" {}
provider "azurerm" { features {} }
provider "github"  { owner = var.github_org }

###############################################################################
# 3. Entra ID Side: App Registration + Service Principal
###############################################################################

data "azuread_client_config" "current" {}

resource "azuread_application" "this" {
  for_each     = local.sps
  display_name = each.key
  notes        = "Owner: ${each.value.owner_team} | ${each.value.purpose} | Managed by Terraform"
  owners       = [data.azuread_client_config.current.object_id]
}

resource "azuread_service_principal" "this" {
  for_each  = local.sps
  client_id = azuread_application.this[each.key].client_id
  owners    = [data.azuread_client_config.current.object_id]

  # Enterprise tenants often have "User assignment required" enabled by default; disabling it allows workflows to function properly
  app_role_assignment_required = false
}

###############################################################################
# 4. RBAC: scope directly uses the complete ARM ID from the CSV + optional ABAC
###############################################################################

resource "azurerm_role_assignment" "this" {
  for_each = local.rbac_map

  scope                = each.value.scope_ref
  role_definition_name = each.value.role_definition_name
  principal_id         = azuread_service_principal.this[each.value.sp_name].object_id
  principal_type       = each.value.principal_type

  # dynamic ABAC: only inject when condition_mode == "exclude_privileged"
  condition_version = each.value.condition_mode == "exclude_privileged" ? "2.0" : null
  condition         = each.value.condition_mode == "exclude_privileged" ? local.exclude_privileged_condition : null

  # skip service principal aad check, as may encounter ADD->ARM replication delay
  skip_service_principal_aad_check = true

  # support for description: azurerm provider 4.0+, delete this line if using older version
  description = each.value.description
}

# RBAC propagation buffer: downstream (business repo first run) depends on it to avoid 403 within 60s
resource "time_sleep" "rbac_propagation" {
  depends_on      = [azurerm_role_assignment.this]
  create_duration = "60s"
}

###############################################################################
# 5. Federated Credential —— Immutable ID subject
#
#   environment type:
#     repo:<ORG>@<ORG_ID>/<REPO>@<REPO_ID>:environment:<ENV>
#   pull_request type:
#     repo:<ORG>@<ORG_ID>/<REPO>@<REPO_ID>:pull_request
#
#   ★ Use repo_id (numeric) instead of repo name -> Prevents issues if the repo is renamed / repojacking
#   ★ Reference github_repository.this -> Terraform automatically puts repo creation first
###############################################################################

resource "azuread_application_federated_identity_credential" "this" {
  for_each = local.fic_map

  application_id = azuread_application.this[each.value.sp_name].id
  display_name   = "gh-${each.value.repo_name}-${each.value.environment}"
  description    = "OIDC trust for ${each.value.repo_name} / ${each.value.environment} (managed by Terraform)"
  issuer         = "https://token.actions.githubusercontent.com"
  audiences      = ["api://AzureADTokenExchange"]

  subject = each.value.subject_type == "pull_request"
    ? "repo:${var.github_org}@${data.github_organization.this.id}/${each.value.repo_name}@${github_repository.this[each.value.repo_name].repo_id}:pull_request"
    : "repo:${var.github_org}@${data.github_organization.this.id}/${each.value.repo_name}@${github_repository.this[each.value.repo_name].repo_id}:environment:${each.value.environment}"
}

###############################################################################
# 6. (Optional) Write back three variables to GitHub Environment Variables
#    This way business repositories don't even need to manually input secrets/vars — fully automated closed loop
###############################################################################

locals {
  # Each (repo, environment) combination corresponds to an SP: currently bootstrap in CSV covers all
  env_var_targets = {
    for k, r in local.fic_map : k => r
    if r.subject_type == "environment"
  }
}

resource "github_actions_environment_variable" "tenant_id" {
  for_each = local.env_var_targets

  repository    = each.value.repo_name
  environment   = each.value.environment
  variable_name = "AZURE_TENANT_ID"
  value         = data.azuread_client_config.current.tenant_id
}

resource "github_actions_environment_variable" "client_id" {
  for_each = local.env_var_targets

  repository    = each.value.repo_name
  environment   = each.value.environment
  variable_name = "AZURE_CLIENT_ID"
  value         = azuread_application.this[each.value.sp_name].client_id
}

resource "github_actions_environment_variable" "subscription_id" {
  for_each = local.env_var_targets

  repository    = each.value.repo_name
  environment   = each.value.environment
  variable_name = "AZURE_SUBSCRIPTION_ID"
  # Pick the first subscription scope for this SP from rbac.csv as the default value
  value = try(
    element([
      for r in local.rbac : r.scope_ref
      if r.sp_name == each.value.sp_name && r.scope_type == "subscription"
    ], 0),
    "SET-ME" # Bootstrap itself has no subscription scope; fill it in manually or pass it via tfvars
  )

  depends_on = [time_sleep.rbac_propagation]
}