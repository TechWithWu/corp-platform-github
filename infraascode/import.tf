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
    "sp-corp-platform-management-prod" = { app = "applications/e12f41c6-34bc-462b-8fb2-a6af8ff141ef", sp = "servicePrincipals/9acbe9c8-6f82-40ee-802f-8a783ee759eb" }
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