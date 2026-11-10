# GitHub-as-Code: Enterprise Platform & Application Governance

This Terraform configuration automates the provisioning of enterprise repositories on GitHub, scaled to support hundreds of repositories with rigorous branch protection and environment security gates.

---

## 5 Core Enterprise Governance Rules Enforced

### 1. `dev` & `main` Branch Direct Commits Blocked
- Direct `git push` to `dev` (and `main`) is strictly rejected.
- All code changes **must** arrive via a Pull Request.
- Requires approving reviews, Code Owner sign-off, conversation resolution, and strict linear history.
- Enforced on repository administrators (`enforce_admins = true`, no bypass permitted).

### 2. Status Checks Decoupled from Branch Protection
- **Status checks are removed from branch protection** because each repository uses a different CI/CD pipeline (e.g., container build, unit tests, security scans, static web app builds).
- This avoids tight coupling between centralized Terraform code and diverse repository workflows while keeping direct commit blocks 100% airtight.

### 3. Per-Repository Designated Approver Gate in `repositories.json`
- Designated approvers are configured **individually per repository** directly inside `/githubascode/repositories.json`.
  - `corp-billing-api`: `seniorguy@gmail.com` (`seniorguy`)
  - `corp-billing-web`: `billing-web-lead@gmail.com` (`billingweblead`)
  - `corp-products-api`: `product-architect@gmail.com` (`productarchitect`)
  - `corp-platform-management`: `ops-lead@gmail.com` (`opslead`)
  - `corp-platform-connectivity`: `network-lead@gmail.com` (`netlead`)
- Deployments or workflow runs targeting the `prod` environment pause until approved by that repository's designated approvers.
- Administrators cannot bypass this gate (`can_admins_bypass = false`).

### 4. 4 Full Deployment Environments with Dedicated Azure OIDC
Every application repository receives 4 isolated deployment environments:
- **`dev`**: Development workload subscription & SPN
- **`qa`**: Automated QA / Integration testing subscription & SPN
- **`cae`**: Customer Acceptance Environment / UAT staging subscription & SPN
- **`prod`**: Production subscription & SPN (Gated by designated approver)

Each environment receives its own `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` stored securely in encrypted GitHub environment secrets.

### 5. Scalable Decoupled Catalog (`repositories.json`)
- To manage hundreds of repositories without editing Terraform code, all repository definitions are maintained in a separate file: **`/githubascode/repositories.json`**.
- Onboarding repository #100 or #500 is as simple as appending a JSON object to `repositories.json` and running `terraform apply`.

---

## Directory Structure

```text
/.github/workflows/
└── gac.yml                    # Automated CI/CD: monitors main + githubascode/**, runs test, plan, pauses for approver, applies

/githubascode/
├── repositories.json          # Decoupled catalog for scaling to hundreds of repositories
├── repositories.tf            # Dynamically parses and normalizes repositories.json
├── main.tf                    # Instantiates module.repositories with approvals & branch rules
├── provider.tf                # backend "azurerm" (Azure Storage Account tfstate) & provider "github"
├── variables.tf               # Root variables and optional catalog overrides
├── outputs.tf                 # Exports URLs, environments, branches, and approver status
├── terraform.tfvars.example   # Optional tfvars for catalog overrides
├── tests/
│   └── repository_validation.tftest.hcl  # Native Terraform 1.6+ unit & integration test suite
└── modules/
    └── repository/            # Reusable GitHub repository module
        ├── main.tf            # github_repository, branch_protection, environments, secrets
        ├── variables.tf       # Module contracts
        └── outputs.tf         # Module outputs
```

---

## Adding a New Repository to the Catalog

Simply append a new entry to `repositories.json`:

```json
{
  "name": "corp-payments-api",
  "type": "application",
  "description": "Payment Gateway Microservice",
  "protected_branches": ["main", "dev"],
  "required_approvals": 1,
  "prod_approvers": [
    {
      "email": "payments-lead@gmail.com",
      "username": "paymentslead"
    }
  ],
  "topics": ["microservice", "payments", "api"],
  "environments": {
    "dev": {
      "azure_client_id": "10000000-0000-0000-0000-000000000050",
      "azure_tenant_id": "11111111-1111-1111-1111-111111111111",
      "azure_subscription_id": "30000000-0000-0000-0000-000000000001"
    },
    "qa": {
      "azure_client_id": "10000000-0000-0000-0000-000000000051",
      "azure_tenant_id": "11111111-1111-1111-1111-111111111111",
      "azure_subscription_id": "30000000-0000-0000-0000-000000000002"
    },
    "cae": {
      "azure_client_id": "10000000-0000-0000-0000-000000000052",
      "azure_tenant_id": "11111111-1111-1111-1111-111111111111",
      "azure_subscription_id": "30000000-0000-0000-0000-000000000003"
    },
    "prod": {
      "azure_client_id": "20000000-0000-0000-0000-000000000050",
      "azure_tenant_id": "11111111-1111-1111-1111-111111111111",
      "azure_subscription_id": "40000000-0000-0000-0000-000000000001"
    }
  }
}
```

---

## Remote State in Azure Storage Account (`provider.tf`)

Terraform remote state is stored securely in Azure Blob Storage with automated state locking:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state-prod"
    storage_account_name = "stcorpghasstateprod"
    container_name       = "tfstate"
    key                  = "githubascode.tfstate"
    use_oidc             = true
  }
}
```

- **Passwordless Authentication**: Connects using Azure Workload Identity / OIDC (`use_oidc = true`).
- **No Long-Lived Secrets**: Uses temporary tokens authenticated through the GitHub runner's OpenID Connect token (`ARM_CLIENT_ID`, `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID`).

---

## Automated CI/CD Workflow (`.github/workflows/gac.yml`)

The repository runs an enterprise governance pipeline whenever changes are made to `githubascode/`:

1. **Trigger**:
   - Monitored branch: `main`
   - Path filter: `githubascode/**`
   - Also supports `pull_request` validation and `workflow_dispatch`.
2. **Phase 1: Validate, Test & Plan (`terraform-test-and-plan`)**:
   - Authenticates to Azure via OIDC (`azure/login@v2`).
   - Runs `terraform fmt -check`, `terraform init`, and `terraform validate`.
   - Executes native unit & integration test suites (`terraform test`).
   - Generates plan preview and archives the binary `tfplan` artifact.
   - Publishes Markdown summary to `$GITHUB_STEP_SUMMARY` and PR comments.
3. **Phase 2: Manual Approver Gate & Apply (`terraform-apply`)**:
   - Bound to GitHub Environment: `production`.
   - **Execution pauses** until designated environment approvers review and approve the run in GitHub Actions.
   - Once approved, downloads the verified `tfplan` artifact and runs `terraform apply -auto-approve tfplan`.
