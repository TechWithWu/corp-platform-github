export const ORIGINAL_WORKFLOW_YAML = `name: 'Protect Terraform GitHub Repository & Branch Rules'

on:
  workflow_dispatch:
    inputs:
      target_branch:
        description: 'Target branch to protect'
        required: true
        default: 'main'
        type: string
      azure_client_id:
        description: 'AZURE_CLIENT_ID (from bootstrap.ps1)'
        required: false
        default: ''
        type: string
      azure_tenant_id:
        description: 'AZURE_TENANT_ID (from bootstrap.ps1)'
        required: false
        default: ''
        type: string
      azure_subscription_id:
        description: 'AZURE_SUBSCRIPTION_ID (from bootstrap.ps1)'
        required: false
        default: ''
        type: string
      required_approvals:
        description: 'Number of required approving reviews'
        required: true
        default: '1'
        type: choice
        options:
          - '1'
          - '2'
          - '0'
      dismiss_stale_reviews:
        description: 'Dismiss approving reviews when new commits are pushed'
        required: true
        default: true
        type: boolean
      require_code_owner_reviews:
        description: 'Require review from Code Owners'
        required: true
        default: true
        type: boolean
      enforce_admins:
        description: 'Enforce all branch protection rules on repository administrators'
        required: true
        default: true
        type: boolean
      require_linear_history:
        description: 'Require linear commit history (prevent merge commits)'
        required: true
        default: true
        type: boolean
      require_conversation_resolution:
        description: 'Require all conversation comments to be resolved before merging'
        required: true
        default: true
        type: boolean
      allow_force_pushes:
        description: 'Permit force pushes (Dangerous for Terraform state repositories)'
        required: true
        default: false
        type: boolean
      allow_deletions:
        description: 'Permit deletion of target branch'
        required: true
        default: false
        type: boolean
      required_status_checks:
        description: 'Comma-separated status checks that must pass before merging'
        required: true
        default: 'Terraform Unit Tests, Terraform Plan'
        type: string
      setup_environments:
        description: 'Provision GitHub Environments (prod) for Azure OIDC'
        required: true
        default: true
        type: boolean

permissions:
  contents: write
  administration: write
  id-token: write

jobs:
  apply-branch-protection:
    name: 'Apply Terraform Branch Protection & Store Secrets'
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v4

      - name: 'Mask Azure OIDC Inputs'
        run: |
          if [ -n "\${{ inputs.azure_client_id }}" ]; then
            echo "::add-mask::\${{ inputs.azure_client_id }}"
          fi
          if [ -n "\${{ inputs.azure_tenant_id }}" ]; then
            echo "::add-mask::\${{ inputs.azure_tenant_id }}"
          fi
          if [ -n "\${{ inputs.azure_subscription_id }}" ]; then
            echo "::add-mask::\${{ inputs.azure_subscription_id }}"
          fi

      - name: 'Setup Environments for Azure OIDC'
        if: \${{ inputs.setup_environments == true}}
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
          script: |
            const targetEnv = 'prod';
            const environments = Array.from(new Set(['prod', targetEnv]));
            for (const envName of environments) {
              try {
                await github.rest.repos.createOrUpdateEnvironment({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  environment_name: envName
                });
                console.log(\`Environment '\${envName}' ready.\`);
              } catch (err) {
                console.warn(\`Note on environment '\${envName}': \${err.message}\`);
              }
            }

      - name: 'Store Azure Credentials in Environment'
        if: \${{ inputs.azure_client_id != '' || inputs.azure_tenant_id != '' || inputs.azure_subscription_id != '' }}
        env:
          GH_TOKEN: \${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
          TARGET_ENV: 'prod'
          ALSO_PROD: \${{ inputs.also_store_in_production }}
          AZ_CLIENT_ID: \${{ inputs.azure_client_id }}
          AZ_TENANT_ID: \${{ inputs.azure_tenant_id }}
          AZ_SUB_ID: \${{ inputs.azure_subscription_id }}
        run: |
          set +e
          echo "Configuring Azure OIDC credentials in environment: $TARGET_ENV"

          ENVS=("$TARGET_ENV")
          if [ "$ALSO_PROD" = "true" ] && [ "$TARGET_ENV" != "production" ]; then
            ENVS+=("production")
          fi

          for ENV in "\${ENVS[@]}"; do
            echo "Processing environment: $ENV"

            if [ -n "$AZ_CLIENT_ID" ]; then
              echo "$AZ_CLIENT_ID" | gh secret set AZURE_CLIENT_ID --env "$ENV" 2>&1
              if [ $? -eq 0 ]; then
                echo "Successfully saved secret AZURE_CLIENT_ID in environment $ENV"
              else
                echo "Notice: Could not write secret AZURE_CLIENT_ID directly via token. Trying variable fallback."
              fi
              gh variable set AZURE_CLIENT_ID --env "$ENV" --body "$AZ_CLIENT_ID" 2>&1 || true
            fi

            if [ -n "$AZ_TENANT_ID" ]; then
              echo "$AZ_TENANT_ID" | gh secret set AZURE_TENANT_ID --env "$ENV" 2>&1
              if [ $? -eq 0 ]; then
                echo "Successfully saved secret AZURE_TENANT_ID in environment $ENV"
              fi
              gh variable set AZURE_TENANT_ID --env "$ENV" --body "$AZ_TENANT_ID" 2>&1 || true
            fi

            if [ -n "$AZ_SUB_ID" ]; then
              echo "$AZ_SUB_ID" | gh secret set AZURE_SUBSCRIPTION_ID --env "$ENV" 2>&1
              if [ $? -eq 0 ]; then
                echo "Successfully saved secret AZURE_SUBSCRIPTION_ID in environment $ENV"
              fi
              gh variable set AZURE_SUBSCRIPTION_ID --env "$ENV" --body "$AZ_SUB_ID" 2>&1 || true
            fi
          done

      - name: 'Verify Token & Configure Branch Protection'
        id: protect-branch
        uses: actions/github-script@v7
        env:
          TARGET_BRANCH: \${{ inputs.target_branch }}
          REQUIRED_APPROVALS: \${{ inputs.required_approvals }}
          DISMISS_STALE: \${{ inputs.dismiss_stale_reviews }}
          REQUIRE_CODE_OWNERS: \${{ inputs.require_code_owner_reviews }}
          ENFORCE_ADMINS: \${{ inputs.enforce_admins }}
          REQUIRE_LINEAR_HISTORY: \${{ inputs.require_linear_history }}
          REQUIRE_CONVERSATION_RESOLUTION: \${{ inputs.require_conversation_resolution }}
          ALLOW_FORCE_PUSHES: \${{ inputs.allow_force_pushes }}
          ALLOW_DELETIONS: \${{ inputs.allow_deletions }}
          CHECKS_RAW: \${{ inputs.required_status_checks }}
        with:
          github-token: \${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
          script: |
            const branch = process.env.TARGET_BRANCH;
            const approvals = parseInt(process.env.REQUIRED_APPROVALS, 10);
            const dismissStale = process.env.DISMISS_STALE === 'true';
            const requireCodeOwners = process.env.REQUIRE_CODE_OWNERS === 'true';
            const enforceAdmins = process.env.ENFORCE_ADMINS === 'true';
            const requireLinear = process.env.REQUIRE_LINEAR_HISTORY === 'true';
            const requireResolve = process.env.REQUIRE_CONVERSATION_RESOLUTION === 'true';
            const allowForcePushes = process.env.ALLOW_FORCE_PUSHES === 'true';
            const allowDeletions = process.env.ALLOW_DELETIONS === 'true';

            const contexts = process.env.CHECKS_RAW
              ? process.env.CHECKS_RAW.split(',').map(s => s.trim()).filter(Boolean)
              : ['Terraform Unit Tests', 'Terraform Plan'];

            console.log(\`Configuring branch protection for repository: \${context.repo.owner}/\${context.repo.repo}\`);
            console.log(\`Target Branch: \${branch}\`);
            console.log(\`Required Status Checks: \${JSON.stringify(contexts)}\`);

            const protectionPayload = {
              owner: context.repo.owner,
              repo: context.repo.repo,
              branch: branch,
              required_status_checks: {
                strict: true,
                contexts: contexts
              },
              enforce_admins: enforceAdmins,
              required_pull_request_reviews: approvals > 0 ? {
                dismiss_stale_reviews: dismissStale,
                require_code_owner_reviews: requireCodeOwners,
                required_approving_review_count: approvals,
                require_last_push_approval: true
              } : null,
              restrictions: null,
              required_linear_history: requireLinear,
              allow_force_pushes: allowForcePushes,
              allow_deletions: allowDeletions,
              block_creations: false,
              required_conversation_resolution: requireResolve
            };

            try {
              const response = await github.rest.repos.updateBranchProtection(protectionPayload);
              console.log('Branch protection successfully applied:', response.status);
              core.setOutput('status', 'success');
              core.setOutput('branch', branch);
            } catch (err) {
              console.error('Failed to update branch protection:', err.message);
              if (err.status === 403 || err.status === 404) {
                core.setFailed(
                  \`Permission error (\${err.status}). Ensure the workflow has 'administration: write' permission or provide a Personal Access Token (PAT) with 'repo' scope as secret 'ADMIN_GITHUB_TOKEN'. Details: \${err.message}\`
                );
              } else {
                core.setFailed(\`Error applying branch protection: \${err.message}\`);
              }
            }

      - name: 'Generate Execution Summary'
        if: always()
        run: |
          cat << 'EOF' >> $GITHUB_STEP_SUMMARY
          ## Terraform Repository Security & Branch Protection Report

          The branch protection rules have been configured for **\${{ inputs.target_branch }}**.

          | Security Parameter | Configured Value |
          |---|---|
          | **Target Protected Branch** | \`\${{ inputs.target_branch }}\` |
          | **Target Environment** | \`\${{ inputs.target_environment }}\` |
          | **Azure Client ID Provided** | \`\${{ inputs.azure_client_id != '' }}\` |
          | **Azure Tenant ID Provided** | \`\${{ inputs.azure_tenant_id != '' }}\` |
          | **Azure Subscription ID Provided** | \`\${{ inputs.azure_subscription_id != '' }}\` |
          | **Required Status Checks** | \`\${{ inputs.required_status_checks }}\` |
          | **Require Branch Up-to-Date** | \`true\` (Strict) |
          | **Required Approvals** | \`\${{ inputs.required_approvals }}\` |
          | **Dismiss Stale Reviews** | \`\${{ inputs.dismiss_stale_reviews }}\` |
          | **Require Code Owner Review** | \`\${{ inputs.require_code_owner_reviews }}\` |
          | **Enforce on Administrators** | \`\${{ inputs.enforce_admins }}\` |
          | **Require Linear History** | \`\${{ inputs.require_linear_history }}\` |
          | **Require Conversation Resolution** | \`\${{ inputs.require_conversation_resolution }}\` |
          | **Allow Force Pushes** | \`\${{ inputs.allow_force_pushes }}\` |
          | **Allow Branch Deletions** | \`\${{ inputs.allow_deletions }}\` |

          ### Credentials in Environment \`\${{ inputs.target_environment }}\`
          The Azure OIDC parameters (\`AZURE_CLIENT_ID\`, \`AZURE_TENANT_ID\`, \`AZURE_SUBSCRIPTION_ID\`) have been configured for your target environment.

          ### Next Steps (from README.md)
          1. **Create Feature Branch**:
             \`\`\`bash
             git checkout -b feature/platform-setup
             git add .
             git commit -m "feat: configure corporate platform architecture"
             git push origin feature/platform-setup
             \`\`\`
          2. **Open Pull Request to \`main\`**:
             - GitHub Actions will run \`Terraform Unit Tests\` and \`Terraform Plan\`.
             - Changes will be formatted, validated with Checkov, and the plan output will be posted directly to the PR comment.
             - Once approved by reviewers, merge to \`main\` to trigger automated \`Terraform Apply\`.
          EOF
`;

export const PURE_WORKFLOW_YAML = `name: 'Protect Terraform GitHub Repository & Branch Rules'

on:
  workflow_dispatch:
    inputs:
      target_branch:
        description: 'Target branch to protect'
        required: true
        default: 'main'
        type: string
      required_approvals:
        description: 'Number of required approving reviews'
        required: true
        default: '1'
        type: choice
        options:
          - '1'
          - '2'
          - '0'
      dismiss_stale_reviews:
        description: 'Dismiss approving reviews when new commits are pushed'
        required: true
        default: true
        type: boolean
      require_code_owner_reviews:
        description: 'Require review from Code Owners'
        required: true
        default: true
        type: boolean
      enforce_admins:
        description: 'Enforce all branch protection rules on repository administrators'
        required: true
        default: true
        type: boolean
      require_linear_history:
        description: 'Require linear commit history (prevent merge commits)'
        required: true
        default: true
        type: boolean
      require_conversation_resolution:
        description: 'Require all conversation comments to be resolved before merging'
        required: true
        default: true
        type: boolean
      allow_force_pushes:
        description: 'Permit force pushes (Dangerous for Terraform state repositories)'
        required: true
        default: false
        type: boolean
      allow_deletions:
        description: 'Permit deletion of target branch'
        required: true
        default: false
        type: boolean
      required_status_checks:
        description: 'Comma-separated status checks that must pass before merging'
        required: true
        default: 'Terraform Unit Tests, Terraform Plan'
        type: string

permissions:
  contents: read
  administration: write

jobs:
  apply-branch-protection:
    name: 'Apply Terraform Branch Protection'
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v4

      - name: 'Verify Token & Configure Branch Protection'
        id: protect-branch
        uses: actions/github-script@v7
        env:
          TARGET_BRANCH: \${{ inputs.target_branch }}
          REQUIRED_APPROVALS: \${{ inputs.required_approvals }}
          DISMISS_STALE: \${{ inputs.dismiss_stale_reviews }}
          REQUIRE_CODE_OWNERS: \${{ inputs.require_code_owner_reviews }}
          ENFORCE_ADMINS: \${{ inputs.enforce_admins }}
          REQUIRE_LINEAR_HISTORY: \${{ inputs.require_linear_history }}
          REQUIRE_CONVERSATION_RESOLUTION: \${{ inputs.require_conversation_resolution }}
          ALLOW_FORCE_PUSHES: \${{ inputs.allow_force_pushes }}
          ALLOW_DELETIONS: \${{ inputs.allow_deletions }}
          CHECKS_RAW: \${{ inputs.required_status_checks }}
        with:
          github-token: \${{ secrets.ADMIN_GITHUB_TOKEN || secrets.GITHUB_TOKEN }}
          script: |
            const branch = process.env.TARGET_BRANCH;
            const approvals = parseInt(process.env.REQUIRED_APPROVALS, 10);
            const dismissStale = process.env.DISMISS_STALE === 'true';
            const requireCodeOwners = process.env.REQUIRE_CODE_OWNERS === 'true';
            const enforceAdmins = process.env.ENFORCE_ADMINS === 'true';
            const requireLinear = process.env.REQUIRE_LINEAR_HISTORY === 'true';
            const requireResolve = process.env.REQUIRE_CONVERSATION_RESOLUTION === 'true';
            const allowForcePushes = process.env.ALLOW_FORCE_PUSHES === 'true';
            const allowDeletions = process.env.ALLOW_DELETIONS === 'true';

            const contexts = process.env.CHECKS_RAW
              ? process.env.CHECKS_RAW.split(',').map(s => s.trim()).filter(Boolean)
              : ['Terraform Unit Tests', 'Terraform Plan'];

            console.log(\`Configuring branch protection for repository: \${context.repo.owner}/\${context.repo.repo}\`);
            console.log(\`Target Branch: \${branch}\`);
            console.log(\`Required Status Checks: \${JSON.stringify(contexts)}\`);

            const protectionPayload = {
              owner: context.repo.owner,
              repo: context.repo.repo,
              branch: branch,
              required_status_checks: {
                strict: true,
                contexts: contexts
              },
              enforce_admins: enforceAdmins,
              required_pull_request_reviews: approvals > 0 ? {
                dismiss_stale_reviews: dismissStale,
                require_code_owner_reviews: requireCodeOwners,
                required_approving_review_count: approvals,
                require_last_push_approval: true
              } : null,
              restrictions: null,
              required_linear_history: requireLinear,
              allow_force_pushes: allowForcePushes,
              allow_deletions: allowDeletions,
              block_creations: false,
              required_conversation_resolution: requireResolve
            };

            try {
              const response = await github.rest.repos.updateBranchProtection(protectionPayload);
              console.log('Branch protection successfully applied:', response.status);
              core.setOutput('status', 'success');
              core.setOutput('branch', branch);
            } catch (err) {
              console.error('Failed to update branch protection:', err.message);
              if (err.status === 403 || err.status === 404) {
                core.setFailed(
                  \`Permission error (\${err.status}). Ensure the workflow has 'administration: write' permission or provide a Personal Access Token (PAT) with 'repo' scope as secret 'ADMIN_GITHUB_TOKEN'. Details: \${err.message}\`
                );
              } else {
                core.setFailed(\`Error applying branch protection: \${err.message}\`);
              }
            }

      - name: 'Generate Execution Summary'
        if: always()
        run: |
          cat << 'EOF' >> $GITHUB_STEP_SUMMARY
          ## Terraform Repository Security & Branch Protection Report

          The branch protection rules have been configured for **\${{ inputs.target_branch }}**.

          | Security Parameter | Configured Value |
          |---|---|
          | **Target Protected Branch** | \`\${{ inputs.target_branch }}\` |
          | **Required Status Checks** | \`\${{ inputs.required_status_checks }}\` |
          | **Require Branch Up-to-Date** | \`true\` (Strict) |
          | **Required Approvals** | \`\${{ inputs.required_approvals }}\` |
          | **Dismiss Stale Reviews** | \`\${{ inputs.dismiss_stale_reviews }}\` |
          | **Require Code Owner Review** | \`\${{ inputs.require_code_owner_reviews }}\` |
          | **Enforce on Administrators** | \`\${{ inputs.enforce_admins }}\` |
          | **Require Linear History** | \`\${{ inputs.require_linear_history }}\` |
          | **Require Conversation Resolution** | \`\${{ inputs.require_conversation_resolution }}\` |
          | **Allow Force Pushes** | \`\${{ inputs.allow_force_pushes }}\` |
          | **Allow Branch Deletions** | \`\${{ inputs.allow_deletions }}\` |

          ### Next Steps
          1. **Create Feature Branch**:
             \`\`\`bash
             git checkout -b feature/platform-setup
             git add .
             git commit -m "feat: configure corporate platform architecture"
             git push origin feature/platform-setup
             \`\`\`
          2. **Open Pull Request to \`\${{ inputs.target_branch }}\`**:
             - GitHub Actions will run \`Terraform Unit Tests\` and \`Terraform Plan\`.
             - Changes will be formatted, validated with Checkov, and the plan output will be posted directly to the PR comment.
             - Once approved by reviewers, merge to \`\${{ inputs.target_branch }}\` to trigger automated \`Terraform Apply\`.
          EOF
`;

export interface AuditIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'CLEANSED';
  title: string;
  category: string;
  cwe?: string;
  problem: string;
  solution: string;
  linesRemoved: string;
}

export const SECURITY_AUDIT_ISSUES: AuditIssue[] = [
  {
    id: 'dispatch-secrets',
    severity: 'CRITICAL',
    title: 'Secret Leak via Workflow Dispatch Inputs',
    category: 'Credential Exposure',
    cwe: 'CWE-532: Insertion of Sensitive Information into Log / UI',
    problem: 'Passing AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_SUBSCRIPTION_ID as workflow_dispatch inputs means anyone with read access to the repo can view the raw inputs in GitHub Actions Run History (under the "Run details" inputs summary), bypassing secret masking.',
    solution: 'Remove all secret inputs from workflow_dispatch. Secrets should only be provisioned out-of-band via GitHub Environment Secrets or Terraform.',
    linesRemoved: 'Lines 11-25 (azure_client_id, azure_tenant_id, azure_subscription_id inputs)'
  },
  {
    id: 'variable-fallback',
    severity: 'HIGH',
    title: 'Dangerous Fallback to Plaintext Repository Variables',
    category: 'Information Disclosure',
    cwe: 'CWE-312: Cleartext Storage of Sensitive Information',
    problem: 'In the original script, when `gh secret set` fails due to insufficient PAT scope, line 155, 163, 171 executes `gh variable set --body "$AZ_CLIENT_ID"`. GitHub repository/environment variables are completely unencrypted and publicly visible in plaintext to all collaborators!',
    solution: 'Eliminate the credential storage step entirely. Branch protection has no business managing cloud credentials.',
    linesRemoved: 'Lines 127-173 (Store Azure Credentials step & variable fallbacks)'
  },
  {
    id: 'overprivileged-id-token',
    severity: 'MEDIUM',
    title: 'Redundant & Overprivileged id-token: write Permission',
    category: 'Principle of Least Privilege',
    cwe: 'CWE-250: Execution with Unnecessary Privileges',
    problem: 'The workflow declared `id-token: write`. This permission instructs GitHub Actions to issue OpenID Connect (OIDC) JWT tokens to federate with Azure/AWS/GCP. However, this workflow only calls GitHub REST APIs to set branch protection! Requesting id-token: write increases the attack surface for token theft.',
    solution: 'Drop `id-token: write`. Downgrade `contents: write` to `contents: read`. Only retain `administration: write` needed for repo protection.',
    linesRemoved: 'Line 84 (`id-token: write`) & Line 82 (`contents: write -> contents: read`)'
  },
  {
    id: 'undefined-variables',
    severity: 'MEDIUM',
    title: 'Broken References to Undefined Variables',
    category: 'Workflow Integrity & Reliability',
    problem: 'The original workflow referenced `\${{ inputs.also_store_in_production }}` (line 132) and `\${{ inputs.target_environment }}` (lines 260 & 275), but neither input was declared in the `inputs:` block! This caused silent evaluation bugs and empty table entries.',
    solution: 'Removed all dangling references and fixed the summary report to reflect actual parameters.',
    linesRemoved: 'Lines 132, 260, 275-276'
  },
  {
    id: 'srp-violation',
    severity: 'HIGH',
    title: 'Violation of Single Responsibility Principle (Impure Pipeline)',
    category: 'Architectural Hygiene',
    problem: 'Branch protection is a governance policy applied to git references. Injecting Azure cloud infrastructure identity into a branch protection workflow creates tight coupling, slows down PR guardrails, and requires re-entering cloud IDs on every manual trigger.',
    solution: 'Decouple branch governance into a pure, deterministic, idempotent workflow. Move cloud credentials into dedicated CI/CD execution workflows.',
    linesRemoved: 'Entire Azure OIDC credential management lifecycle'
  }
];

export const BOOTSTRAP_PS1_SCRIPT = `# bootstrap.ps1 - Pure Out-of-Band Setup (Run once by DevOps / SecOps)
# This securely stores Azure OIDC secrets directly in GitHub without passing them through workflow dispatch!

param(
  [Parameter(Mandatory=$true)]
  [string]$AzureClientId,

  [Parameter(Mandatory=$true)]
  [string]$AzureTenantId,

  [Parameter(Mandatory=$true)]
  [string]$AzureSubscriptionId,

  [string]$Environment = "prod"
)

Write-Host "Creating GitHub Environment '$Environment' if not exists..." -ForegroundColor Cyan
gh api --method PUT -H "Accept: application/vnd.github+json" /repos/{owner}/{repo}/environments/$Environment

Write-Host "Securely setting Azure OIDC credentials in environment: $Environment" -ForegroundColor Green
$AzureClientId | gh secret set AZURE_CLIENT_ID --env $Environment
$AzureTenantId | gh secret set AZURE_TENANT_ID --env $Environment
$AzureSubscriptionId | gh secret set AZURE_SUBSCRIPTION_ID --env $Environment

Write-Host "Done! Secrets are encrypted and safely stored. The branch protection workflow remains 100% pure." -ForegroundColor Green
`;

export const TERRAFORM_IAC_SNIPPET = `# terraform-governance.tf - Alternative Pure Infrastructure-as-Code Approach
# Manage branch protection and Azure secrets declaratively with the official GitHub Terraform Provider

terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

# 1. Branch Protection Rule (Pure Governance)
resource "github_branch_protection" "main" {
  repository_id = var.repository_name
  pattern       = "main"

  enforce_admins = true

  required_status_checks {
    strict   = true
    contexts = ["Terraform Unit Tests", "Terraform Plan"]
  }

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
    required_approving_review_count = 1
    require_last_push_approval      = true
  }

  require_linear_history          = true
  require_conversation_resolution = true
  allows_force_pushes             = false
  allows_deletions                = false
}

# 2. Environment Secrets (Separation of Concerns)
resource "github_repository_environment" "prod" {
  environment  = "prod"
  repository   = var.repository_name
}

resource "github_actions_environment_secret" "azure_client_id" {
  repository  = var.repository_name
  environment = github_repository_environment.prod.environment
  secret_name = "AZURE_CLIENT_ID"
  plaintext_value = var.azure_client_id
}
`;

export const CONSUMER_CI_WORKFLOW = `# .github/workflows/terraform-ci.yml - How Azure OIDC is SECURELY used by CI/CD
name: 'Terraform Plan & Apply (Azure OIDC)'

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  id-token: write # Here id-token: write IS needed for Azure OIDC login!
  contents: read
  pull-requests: write

jobs:
  terraform:
    runs-on: ubuntu-latest
    environment: prod # Pulls secrets from the protected environment
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Native Azure OIDC Authentication (Zero secret keys stored in workflow inputs)
      - name: 'Azure Login with OIDC'
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Plan
        run: terraform plan
`;

export interface PlatformRepoConfig {
  name: string;
  description: string;
  azureClientId: string;
  azureTenantId: string;
  azureSubscriptionId: string;
  scope: string;
  topics: string[];
  requiredApprovals: number;
}

export const DEFAULT_PLATFORM_REPOS: PlatformRepoConfig[] = [
  {
    name: 'corp-platform-foundation',
    description: 'Enterprise governance: Management Groups, Azure Policy, RBAC baselines, and subscription vending',
    azureClientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    azureTenantId: '88888888-4444-4444-4444-121212121212',
    azureSubscriptionId: '11111111-2222-3333-4444-555555555555',
    scope: 'Tenant Root / Management Groups & Vending',
    topics: ['azure', 'landing-zone', 'management-groups', 'policy'],
    requiredApprovals: 1,
  },
  {
    name: 'corp-platform-management',
    description: 'Centralized Ops: Log Analytics, Sentinel, Azure Monitor, and alert policies',
    azureClientId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    azureTenantId: '88888888-4444-4444-4444-121212121212',
    azureSubscriptionId: '22222222-3333-4444-5555-666666666666',
    scope: 'Management Subscription (sub-corp-management)',
    topics: ['azure', 'operations', 'sentinel', 'monitor'],
    requiredApprovals: 1,
  },
  {
    name: 'corp-platform-connectivity',
    description: 'Centralized Networking: Hub VNet, Azure Firewall, VPN/ExpressRoute, and global NSG rules',
    azureClientId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    azureTenantId: '88888888-4444-4444-4444-121212121212',
    azureSubscriptionId: '33333333-4444-5555-6666-777777777777',
    scope: 'Connectivity Subscription (sub-corp-connectivity)',
    topics: ['azure', 'networking', 'firewall', 'hub-spoke'],
    requiredApprovals: 1,
  },
];
