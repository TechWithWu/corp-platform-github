# ---------------------------------------------------------------------------------------------------------------------
# AZURE RBAC MODULE
# Manages Azure Role Assignments based on config/azure-identity/rbac.csv
# ---------------------------------------------------------------------------------------------------------------------

resource "azurerm_role_assignment" "this" {
  for_each = {
    for k, v in var.rbac_assignments : k => v
    if contains(keys(var.service_principal_object_ids), v.sp_name)
  }

  scope                = each.value.scope_ref
  role_definition_name = each.value.role_definition_name
  principal_id         = var.service_principal_object_ids[each.value.sp_name]
  principal_type       = each.value.principal_type != "" ? each.value.principal_type : "ServicePrincipal"
  description          = each.value.description != "" ? each.value.description : null

  # dynamic ABAC: only inject when condition_mode == "exclude_privileged"
  # condition_version = "2.0"
  # condition         = var.exclude_privileged_condition

  # skip service principal aad check, as may encounter ADD->ARM replication delay
  skip_service_principal_aad_check = true
}

# RBAC propagation buffer: downstream (business repo first run) depends on it to avoid 403 within 60s
# resource "time_sleep" "rbac_propagation" {
#   depends_on      = [azurerm_role_assignment.this]
#   create_duration = "60s"
# }