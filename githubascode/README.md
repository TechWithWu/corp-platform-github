# GitHub-as-Code: Enterprise Platform Repositories & Azure OIDC Federation

This Terraform configuration automates the provisioning of enterprise landing zone repositories on GitHub.

## Zero-Boilerplate Authentication (No `github_token` or `github_owner` variables)

The GitHub provider (`integrations/github`) automatically reads the default environment variables provided by GitHub Actions:

- **`GITHUB_TOKEN`**: Standard temporary installation / runner token (`${{ secrets.GITHUB_TOKEN }}` or `${{ secrets.ADMIN_GITHUB_TOKEN }}`).
- **`GITHUB_OWNER`**: Organization or user account (`${{ github.repository_owner }}`).

Because these default variables are resolved automatically, `provider "github" {}` requires **no variables or hardcoded arguments**.

---

## Directory Structure

```text
/githubascode/
├── main.tf                    # Instantiates module.platform_repositories for each repo
├── provider.tf                # Clean provider block: provider "github" {} (auto env discovery)
├── variables.tf               # Platform repository map with dedicated Azure OIDC credentials
├── outputs.tf                 # Exports URLs, environments, and security audit status
├── terraform.tfvars.example   # Sample input variables for dedicated Azure SPNs
└── modules/
    └── repository/            # Reusable GitHub repository module
        ├── main.tf            # github_repository, branch_protection, environment, secrets
        ├── variables.tf       # Module input variables
        └── outputs.tf         # Module outputs
```

---

## Usage in GitHub Actions Workflow

In your CI/CD pipeline, you simply export the built-in runner variables:

```yaml
jobs:
  terraform-github:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      administration: write
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3

      - name: Terraform Apply
        working-directory: ./githubascode
        env:
          # Built-in temporary variables automatically read by provider "github" {}
          GITHUB_TOKEN: ${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
          GITHUB_OWNER: ${{ github.repository_owner }}
        run: |
          terraform init
          terraform apply -auto-approve
```

---

## Local Terminal Execution

```bash
# Export the standard environment variables
export GITHUB_TOKEN="ghp_yourTemporaryPersonalAccessToken"
export GITHUB_OWNER="your-github-org"

cd githubascode
terraform init
terraform plan
terraform apply
```
