# import.tf
import {
  to = module.repositories.github_repository.this["corp-platform-github"]
  id = "corp-platform-github"
}

import {
  to = module.members.github_membership.this["techwithwu"]
  id = "corp-techwithwu:techwithwu"
}

# Service Principals Import
#     service principal name = { app = "applications/<YOUR_CORRECT_APP_OBJECT_ID>", sp = "servicePrincipals/<YOUR_CORRECT_SP_OBJECT_ID>" }
#     YOUR_CORRECT_APP_OBJECT_ID： Microsoft Entra ID -> App registrations -> <YOUR_APP_NAME> -> Overview -> Object ID
#     YOUR_CORRECT_SP_OBJECT_ID： Microsoft Entra ID -> Enterprise applications -> <YOUR_APP_NAME> -> Overview -> Object ID
locals {
  _imp = {
    "sp-corp-platform-management-prod" = { app = "applications/d6f8223b-521f-425d-8852-5524e335c2dd", sp = "servicePrincipals/c56ce271-c1f9-479d-88e0-3d42ff2b56c9" }
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

# Service Principals: Role Assignment Access Control Import

# Service Princiapls: Federated Credentials Import
