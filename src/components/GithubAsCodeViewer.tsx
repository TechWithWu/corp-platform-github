import React, { useState } from 'react';
import {
  FolderGit2,
  FileCode,
  Shield,
  Key,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Lock,
} from 'lucide-react';
import { DEFAULT_PLATFORM_REPOS, PlatformRepoConfig } from '../data/workflowData';

export const GithubAsCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('main.tf');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [repos, setRepos] = useState<PlatformRepoConfig[]>(DEFAULT_PLATFORM_REPOS);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRepo, setNewRepo] = useState<PlatformRepoConfig>({
    name: 'corp-platform-identity',
    description: 'Centralized Identity: Entra ID custom domain, PIM, Conditional Access policies',
    azureClientId: 'd4e5f6a7-b8c9-0123-def4-567890123456',
    azureTenantId: '88888888-4444-4444-4444-121212121212',
    azureSubscriptionId: '44444444-5555-6666-7777-888888888888',
    scope: 'Identity Subscription (sub-corp-identity)',
    topics: ['azure', 'identity', 'entra', 'pim'],
    requiredApprovals: 1,
  });

  const filesContent: Record<string, string> = {
    'main.tf': `# /githubascode/main.tf
module "platform_repositories" {
  source   = "./modules/repository"
  for_each = var.repositories

  name                   = each.key
  description            = each.value.description
  visibility             = coalesce(each.value.visibility, "private")
  topics                 = coalesce(each.value.topics, ["terraform", "azure-platform"])

  # 1. Strict Branch Protection Policy
  target_branch          = "main"
  enforce_admins         = true
  required_approvals     = coalesce(each.value.required_approvals, 1)
  dismiss_stale_reviews  = true
  require_code_owner_reviews = true
  status_checks          = coalesce(each.value.status_checks, ["Terraform Unit Tests", "Terraform Plan"])

  # 2. Dedicated GitHub Environment
  environment_name       = "prod"

  # 3. Dedicated Azure OIDC Credentials per repository
  azure_client_id        = each.value.azure_client_id
  azure_tenant_id        = each.value.azure_tenant_id
  azure_subscription_id = each.value.azure_subscription_id
}
`,
    'variables.tf': `# /githubascode/variables.tf
# Note: github_token and github_owner are NOT declared here.
# The GitHub provider natively reads the default temporary runner environment variables:
# - GITHUB_TOKEN (built-in runner token: \${{ secrets.GITHUB_TOKEN }})
# - GITHUB_OWNER (built-in runner owner context: \${{ github.repository_owner }})

variable "repositories" {
  description = "Map of platform repositories to provision, each with dedicated Azure OIDC credentials."
  type = map(object({
    description           = string
    visibility            = optional(string, "private")
    azure_client_id       = string
    azure_tenant_id       = string
    azure_subscription_id = string
    required_approvals    = optional(number, 1)
    status_checks         = optional(list(string), ["Terraform Unit Tests", "Terraform Plan"])
    topics                = optional(list(string), ["terraform", "azure-landing-zone"])
  }))
}
`,
    'provider.tf': `# /githubascode/provider.tf
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

# The GitHub provider automatically discovers authentication and target scope from standard
# temporary environment variables without hardcoded inputs or variable declarations:
# - GITHUB_TOKEN : Built-in runner token (\${{ secrets.GITHUB_TOKEN }})
# - GITHUB_OWNER : Built-in organization/owner context (\${{ github.repository_owner }})
provider "github" {}
`,
    'outputs.tf': `# /githubascode/outputs.tf
output "repository_urls" {
  description = "Map of created repository names to their GitHub HTML URLs."
  value = {
    for name, repo in module.platform_repositories : name => repo.html_url
  }
}

output "provisioned_environments" {
  description = "The target deployment environment provisioned per repository."
  value = {
    for name, repo in module.platform_repositories : name => repo.environment_name
  }
}

output "security_audit_summary" {
  description = "Audit summary of security protections and OIDC secrets provisioned."
  value = {
    for name, config in var.repositories : name => {
      branch_protection     = "Enforced on 'main' (Admins strictly enforced, linear history required)"
      required_reviews      = config.required_approvals
      environment           = "prod"
      azure_client_id_set   = config.azure_client_id != ""
      azure_tenant_id_set   = config.azure_tenant_id != ""
      azure_subscription_set = config.azure_subscription_id != ""
    }
  }
}
`,
    'terraform.tfvars.example': `# /githubascode/terraform.tfvars.example
# Notice: github_owner and github_token are NOT needed in this tfvars file!
# The GitHub provider automatically reads:
#   GITHUB_TOKEN = "\${{ secrets.GITHUB_TOKEN }}"
#   GITHUB_OWNER = "\${{ github.repository_owner }}"

repositories = {
${repos
  .map(
    (r) => `  "${r.name}" = {
    description           = "${r.description}"
    visibility            = "private"
    azure_client_id       = "${r.azureClientId}" # ${r.scope}
    azure_tenant_id       = "${r.azureTenantId}"
    azure_subscription_id = "${r.azureSubscriptionId}"
    required_approvals    = ${r.requiredApprovals}
    status_checks         = ["Terraform Unit Tests", "Terraform Plan"]
    topics                = [${r.topics.map((t) => `"${t}"`).join(', ')}]
  }`
  )
  .join('\n\n')}
}
`,
    'modules/repository/main.tf': `# /githubascode/modules/repository/main.tf
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = ">= 6.0"
    }
  }
}

# 1. Create GitHub Repository
resource "github_repository" "this" {
  name                   = var.name
  description            = var.description
  visibility             = var.visibility
  auto_init              = true # Initializes with default README.md
  has_issues             = true
  has_projects           = false
  has_wiki               = false
  delete_branch_on_merge = true
  allow_merge_commit     = false
  allow_squash_merge     = true
  allow_rebase_merge     = false
  topics                 = var.topics
}

# 2. Configure Strict Branch Protection Rules for 'main' branch
resource "github_branch_protection" "main" {
  repository_id                   = github_repository.this.name
  pattern                         = var.target_branch
  enforce_admins                  = var.enforce_admins
  required_linear_history         = true
  allows_force_pushes             = false
  allows_deletions                = false
  require_conversation_resolution = true

  required_pull_request_reviews {
    dismiss_stale_reviews           = var.dismiss_stale_reviews
    require_code_owner_reviews      = var.require_code_owner_reviews
    required_approving_review_count = var.required_approvals
    require_last_push_approval      = true
  }

  required_status_checks {
    strict   = true
    contexts = var.status_checks
  }

  depends_on = [github_repository.this]
}

# 3. Create Target Environment (e.g., 'prod')
resource "github_repository_environment" "prod" {
  repository        = github_repository.this.name
  environment       = var.environment_name
  can_admins_bypass = true

  depends_on = [github_repository.this]
}

# 4. Inject Dedicated Azure OIDC Client ID into 'prod' Environment Secret
resource "github_actions_environment_secret" "azure_client_id" {
  count           = var.azure_client_id != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AZURE_CLIENT_ID"
  plaintext_value = var.azure_client_id
}

# 5. Inject Dedicated Azure OIDC Tenant ID into 'prod' Environment Secret
resource "github_actions_environment_secret" "azure_tenant_id" {
  count           = var.azure_tenant_id != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AZURE_TENANT_ID"
  plaintext_value = var.azure_tenant_id
}

# 6. Inject Dedicated Azure OIDC Subscription ID into 'prod' Environment Secret
resource "github_actions_environment_secret" "azure_subscription_id" {
  count           = var.azure_subscription_id != "" ? 1 : 0
  repository      = github_repository.this.name
  environment     = github_repository_environment.prod.environment
  secret_name     = "AZURE_SUBSCRIPTION_ID"
  plaintext_value = var.azure_subscription_id
}
`,
    'modules/repository/variables.tf': `# /githubascode/modules/repository/variables.tf
variable "name" { type = string }
variable "description" { type = string; default = "" }
variable "visibility" { type = string; default = "private" }
variable "topics" { type = list(string); default = ["terraform"] }
variable "target_branch" { type = string; default = "main" }
variable "enforce_admins" { type = bool; default = true }
variable "required_approvals" { type = number; default = 1 }
variable "dismiss_stale_reviews" { type = bool; default = true }
variable "require_code_owner_reviews" { type = bool; default = true }
variable "status_checks" { type = list(string); default = ["Terraform Unit Tests", "Terraform Plan"] }
variable "environment_name" { type = string; default = "prod" }
variable "azure_client_id" { type = string; sensitive = true }
variable "azure_tenant_id" { type = string; sensitive = true }
variable "azure_subscription_id" { type = string; sensitive = true }
`,
    'modules/repository/outputs.tf': `# /githubascode/modules/repository/outputs.tf
output "repository_name" { value = github_repository.this.name }
output "html_url" { value = github_repository.this.html_url }
output "git_clone_url" { value = github_repository.this.git_clone_url }
output "environment_name" { value = github_repository_environment.prod.environment }
output "branch_protection_id" { value = github_branch_protection.main.id }
`,
  };

  const handleCopy = (filename: string) => {
    navigator.clipboard.writeText(filesContent[filename]);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = (filename: string) => {
    const content = filesContent[filename];
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop() || filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddRepo = () => {
    if (!newRepo.name) return;
    setRepos([...repos, newRepo]);
    setShowAddModal(false);
  };

  const handleDeleteRepo = (name: string) => {
    setRepos(repos.filter((r) => r.name !== name));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <FolderGit2 className="w-4 h-4" />
              GitHub-as-Code Terraform Architecture
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Enterprise Platform Repositories & Isolated Azure OIDC Credentials
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl leading-relaxed">
              Every platform repository is provisioned with its own strict branch protection on <code className="text-cyan-300">main</code>,
              a dedicated <code className="text-cyan-300">prod</code> environment, and dedicated Azure OIDC credentials mapped to its cloud domain.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-mono">
              <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded">
                ✓ Zero Variable Boilerplate
              </span>
              <span className="text-slate-400">
                Natively consumes <code className="text-cyan-300">GITHUB_TOKEN</code> and <code className="text-cyan-300">GITHUB_OWNER</code> from runner context
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Another Repository
          </button>
        </div>
      </div>

      {/* 3 Platform Repositories Visual Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <div
            key={repo.name}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-cyan-300">{repo.name}</span>
                {repos.length > 1 && (
                  <button
                    onClick={() => handleDeleteRepo(repo.name)}
                    className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                    title="Remove repository"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{repo.description}</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">Domain Scope:</span>
                <span className="text-slate-300 truncate max-w-[170px]" title={repo.scope}>
                  {repo.scope}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">Branch Protection:</span>
                <span className="text-emerald-400">main (Strict)</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">Environment:</span>
                <span className="text-cyan-400">prod (Secrets injected)</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-500">Client ID:</span>
                <span className="text-slate-300">{repo.azureClientId.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Code Browser & File Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Tree (3 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between pb-2 border-b border-slate-800">
            <span>/githubascode File Tree</span>
            <span className="text-[10px] text-slate-500 font-mono">Terraform</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] text-slate-500 font-mono px-2 py-1">Root Configuration</div>
            {['main.tf', 'variables.tf', 'provider.tf', 'outputs.tf', 'terraform.tfvars.example'].map(
              (file) => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors ${
                    selectedFile === file
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-slate-500" />
                    {file}
                  </span>
                  {selectedFile === file && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              )
            )}

            <div className="text-[11px] text-slate-500 font-mono px-2 pt-3 pb-1">
              Reusable Module: modules/repository/
            </div>
            {[
              'modules/repository/main.tf',
              'modules/repository/variables.tf',
              'modules/repository/outputs.tf',
            ].map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono text-[11px] transition-colors ${
                  selectedFile === file
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  {file.replace('modules/repository/', '')}
                </span>
                {selectedFile === file && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Code Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>githubascode/{selectedFile}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(selectedFile)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {copiedFile === selectedFile ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedFile === selectedFile ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload(selectedFile)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 max-h-[560px] overflow-y-auto whitespace-pre leading-relaxed shadow-xl">
            {filesContent[selectedFile]}
          </div>
        </div>
      </div>

      {/* Add Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Add Platform Repository to GitHub-as-Code
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Repository Name</label>
                <input
                  type="text"
                  value={newRepo.name}
                  onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Description</label>
                <input
                  type="text"
                  value={newRepo.description}
                  onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Azure Client ID (SPN)</label>
                  <input
                    type="text"
                    value={newRepo.azureClientId}
                    onChange={(e) => setNewRepo({ ...newRepo, azureClientId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Azure Subscription ID</label>
                  <input
                    type="text"
                    value={newRepo.azureSubscriptionId}
                    onChange={(e) => setNewRepo({ ...newRepo, azureSubscriptionId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Domain Scope</label>
                <input
                  type="text"
                  value={newRepo.scope}
                  onChange={(e) => setNewRepo({ ...newRepo, scope: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRepo}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Add Repository
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
