# GitHub-as-Code: Enterprise Platform & Application Governance

This Terraform configuration automates the provisioning of enterprise repositories on GitHub, scaled to support hundreds of repositories with rigorous branch and environment protection.

---

## 4 Core Enterprise Governance Rules Enforced

### 1. `dev` Branch Direct Commits Blocked
- Direct `git push` to `dev` (and `main`) is strictly rejected.
- All code changes **must** arrive via a Pull Request.
- Requires approving reviews, Code Owner sign-off, strict linear history, and passing status checks.
- Enforced on administrators (`enforce_admins = true`).

### 2. Designated Approver Gate on `prod` Environment
- Target reviewer: **`seniorguy@gmail.com`** (GitHub user: `seniorguy`).
- Deployments or workflow runs targeting the `prod` environment are paused until approved.
- Administrators cannot bypass this gate (`can_admins_bypass = false`).

### 3. 4 Full Deployment Environments with Dedicated Azure OIDC
Every application repository receives 4 isolated deployment environments:
- **`dev`**: Development workload subscription & SPN
- **`qa`**: Automated QA / Integration testing subscription & SPN
- **`cae`**: Customer Acceptance Environment / UAT staging subscription & SPN
- **`prod`**: Production subscription & SPN (Gated by designated approver)

Each environment receives its own `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` stored securely in encrypted environment secrets.

### 4. Scalable Decoupled Catalog (`repositories.json`)
- To manage hundreds of repositories without editing Terraform code, all repository definitions are maintained in a separate file: **`/githubascode/repositories.json`**.
- Onboarding repository #100 or #500 is as simple as appending a JSON object to `repositories.json` and running `terraform apply`.

---

## Directory Structure

```text
/githubascode/
├── repositories.json          # Decoupled catalog for scaling to hundreds of repositories
├── repositories.tf            # Dynamically parses and normalizes repositories.json
├── main.tf                    # Instantiates module.repositories with approvals & branch rules
├── provider.tf                # provider "github" {} (auto env discovery)
├── variables.tf               # Approver configuration and optional catalog overrides
├── outputs.tf                 # Exports URLs, environments, branches, and approver status
├── terraform.tfvars.example   # Optional tfvars for approver username/email
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
  "status_checks": ["Unit Tests", "Integration Tests"],
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

Then run:
```bash
terraform apply
```
