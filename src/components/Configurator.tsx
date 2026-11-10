import React, { useState } from 'react';
import { Sliders, Copy, Check, Download, RefreshCw, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ConfigState {
  targetBranch: string;
  requiredApprovals: string;
  dismissStaleReviews: boolean;
  requireCodeOwnerReviews: boolean;
  enforceAdmins: boolean;
  requireLinearHistory: boolean;
  requireConversationResolution: boolean;
  allowForcePushes: boolean;
  allowDeletions: boolean;
  requiredStatusChecks: string;
}

const DEFAULT_CONFIG: ConfigState = {
  targetBranch: 'main',
  requiredApprovals: '1',
  dismissStaleReviews: true,
  requireCodeOwnerReviews: true,
  enforceAdmins: true,
  requireLinearHistory: true,
  requireConversationResolution: true,
  allowForcePushes: false,
  allowDeletions: false,
  requiredStatusChecks: 'Terraform Unit Tests, Terraform Plan',
};

export const Configurator: React.FC = () => {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState<boolean>(false);

  const generateYaml = (cfg: ConfigState) => {
    return `name: 'Protect Terraform GitHub Repository & Branch Rules'

on:
  workflow_dispatch:
    inputs:
      target_branch:
        description: 'Target branch to protect'
        required: true
        default: '${cfg.targetBranch}'
        type: string
      required_approvals:
        description: 'Number of required approving reviews'
        required: true
        default: '${cfg.requiredApprovals}'
        type: choice
        options:
          - '1'
          - '2'
          - '0'
      dismiss_stale_reviews:
        description: 'Dismiss approving reviews when new commits are pushed'
        required: true
        default: ${cfg.dismissStaleReviews}
        type: boolean
      require_code_owner_reviews:
        description: 'Require review from Code Owners'
        required: true
        default: ${cfg.requireCodeOwnerReviews}
        type: boolean
      enforce_admins:
        description: 'Enforce all branch protection rules on repository administrators'
        required: true
        default: ${cfg.enforceAdmins}
        type: boolean
      require_linear_history:
        description: 'Require linear commit history (prevent merge commits)'
        required: true
        default: ${cfg.requireLinearHistory}
        type: boolean
      require_conversation_resolution:
        description: 'Require all conversation comments to be resolved before merging'
        required: true
        default: ${cfg.requireConversationResolution}
        type: boolean
      allow_force_pushes:
        description: 'Permit force pushes (Dangerous for Terraform state repositories)'
        required: true
        default: ${cfg.allowForcePushes}
        type: boolean
      allow_deletions:
        description: 'Permit deletion of target branch'
        required: true
        default: ${cfg.allowDeletions}
        type: boolean
      required_status_checks:
        description: 'Comma-separated status checks that must pass before merging'
        required: true
        default: '${cfg.requiredStatusChecks}'
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
  };

  const currentYaml = generateYaml(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protect-branch-${config.targetBranch}-pure.yml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Controls Form (5 cols) */}
      <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">Protection Policy Settings</h3>
          </div>
          <button
            onClick={() => setConfig(DEFAULT_CONFIG)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Defaults
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Target Branch */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Target Branch Default</label>
            <input
              type="text"
              value={config.targetBranch}
              onChange={(e) => setConfig({ ...config, targetBranch: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="main"
            />
          </div>

          {/* Required Approvals */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Required Approvals</label>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '0'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setConfig({ ...config, requiredApprovals: val })}
                  className={`py-2 px-3 rounded-lg border font-mono font-medium transition-colors text-center ${
                    config.requiredApprovals === val
                      ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {val === '0' ? '0 (None)' : `${val} Reviewer${val === '1' ? '' : 's'}`}
                </button>
              ))}
            </div>
          </div>

          {/* Required Status Checks */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Required Status Checks (Comma separated)</label>
            <input
              type="text"
              value={config.requiredStatusChecks}
              onChange={(e) => setConfig({ ...config, requiredStatusChecks: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              placeholder="Terraform Unit Tests, Terraform Plan"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Enforcement & Compliance Flags
            </div>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Enforce on Administrators</span>
              <input
                type="checkbox"
                checked={config.enforceAdmins}
                onChange={(e) => setConfig({ ...config, enforceAdmins: e.target.checked })}
                className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Require Code Owner Reviews</span>
              <input
                type="checkbox"
                checked={config.requireCodeOwnerReviews}
                onChange={(e) => setConfig({ ...config, requireCodeOwnerReviews: e.target.checked })}
                className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Dismiss Stale Reviews on Push</span>
              <input
                type="checkbox"
                checked={config.dismissStaleReviews}
                onChange={(e) => setConfig({ ...config, dismissStaleReviews: e.target.checked })}
                className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Require Linear Commit History</span>
              <input
                type="checkbox"
                checked={config.requireLinearHistory}
                onChange={(e) => setConfig({ ...config, requireLinearHistory: e.target.checked })}
                className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Require Conversation Resolution</span>
              <input
                type="checkbox"
                checked={config.requireConversationResolution}
                onChange={(e) => setConfig({ ...config, requireConversationResolution: e.target.checked })}
                className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Allow Force Pushes (Dangerous)</span>
              <input
                type="checkbox"
                checked={config.allowForcePushes}
                onChange={(e) => setConfig({ ...config, allowForcePushes: e.target.checked })}
                className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Generated Code Preview (7 cols) */}
      <div className="lg:col-span-7 space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">
              .github/workflows/protect-branch.yml (Live Generated Pure Output)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy YAML'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-[640px] overflow-y-auto overflow-x-auto text-xs font-mono text-slate-300 shadow-2xl leading-relaxed whitespace-pre">
          {currentYaml}
        </div>
      </div>
    </div>
  );
};
