# import.tf
import {
  to = module.repositories.github_repository.this["corp-platform-github"]
  id = "corp-platform-github"
}

# import {
#   to = module.members.github_membership.this["techwithwu"]
#   id = "corp-techwithwu:techwithwu"
# }

# Service Principals Import
#     service principal name = { app = "applications/application id", sp = "servicePrincipals/object id" }
locals {
  _imp = {
    "sp-corp-platform-management-prod" = { app = "applications/f7d97ef1-807c-4855-908a-ead05fbb18a0", sp = "servicePrincipals/c56ce271-c1f9-479d-88e0-3d42ff2b56c9" }
  }
}
import {
  for_each = local._imp
  id       = each.value.app
  to       = module.azure_service_principals.azuread_application.this[each.key]
}
import {
  for_each = local._imp
  id       = each.value.sp
  to       = module.azure_service_principals.azuread_service_principal.this[each.key]
}