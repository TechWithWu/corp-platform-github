# import.tf
import {
  to = module.repositories.github_repository.this["corp-platform-github"]
  id = "corp-platform-github"
}

import {
  to = module.members.github_membership.this["techwithwu"]
  id = "corp-techwithwu:techwithwu"
}

# Import: Service Principals 
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

# Import: Role Assignments
import {
  to = module.azure_rbac.azurerm_role_assignment.this["sp-corp-platform-management-prod:Contributor"]
  id = "/subscriptions/6b80b8d5-aef4-4952-8558-1f1b168f47a6/providers/Microsoft.Authorization/roleAssignments/4156036a-31bd-53e0-b4df-c6bc7310c2c9"
}

import {
  to = module.azure_rbac.azurerm_role_assignment.this["sp-corp-platform-management-prod:Storage Blob Data Contributor"]
  id = "/subscriptions/6b80b8d5-aef4-4952-8558-1f1b168f47a6/providers/Microsoft.Authorization/roleAssignments/7c11ed54-f5e2-50c9-b183-49017eee2d84"
}

# Import: Azure Federated Credentials
import {
  to = module.azure_federated_credentials.azuread_application_federated_identity_credential.this["sp-corp-platform-management-prod:corp-platform-github:developer"]
  id = "e12f41c6-34bc-462b-8fb2-a6af8ff141ef/federatedIdentityCredential/de60f300-5ba9-4c7a-becc-1c82b7e4e357"
}

import {
  to = module.azure_federated_credentials.azuread_application_federated_identity_credential.this["sp-corp-platform-management-prod:corp-platform-github:dev"]
  id = "e12f41c6-34bc-462b-8fb2-a6af8ff141ef/federatedIdentityCredential/5d6a7b96-3b77-4801-aee6-3a4176bc4a7e"   # corp-platform-github-environment-dev
}

import {
  to = module.azure_federated_credentials.azuread_application_federated_identity_credential.this["sp-corp-platform-management-prod:corp-platform-github:prod"]
  id = "e12f41c6-34bc-462b-8fb2-a6af8ff141ef/federatedIdentityCredential/d25ae5c0-1383-4f03-ad20-bd83368d8b7b"   # corp-platform-github-environment-prod
}

import {
  to = module.azure_federated_credentials.azuread_application_federated_identity_credential.this["sp-corp-platform-management-prod:corp-platform-github:"]
  id = "e12f41c6-34bc-462b-8fb2-a6af8ff141ef/federatedIdentityCredential/7a745ccd-1dc5-4faf-936d-560a4084dcd9"   # corp-platform-github-pull-request-
}