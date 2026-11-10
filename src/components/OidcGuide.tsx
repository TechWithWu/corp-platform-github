import React, { useState } from 'react';
import { Key, Shield, Terminal, FileCode2, Copy, Check, ArrowRight, ExternalLink, Layers, CheckCircle2 } from 'lucide-react';
import { BOOTSTRAP_PS1_SCRIPT, TERRAFORM_IAC_SNIPPET, CONSUMER_CI_WORKFLOW } from '../data/workflowData';

export const OidcGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bootstrap' | 'consumer' | 'terraform'>('bootstrap');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Concept Architecture Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          <Layers className="w-4 h-4" />
          Separation of Concerns Architecture
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Where Do Azure OIDC Credentials Truly Belong?
        </h2>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          In cloud engineering, we never pass infrastructure credentials through interactive UI inputs on governance pipelines.
          Instead, we divide responsibility into three discrete, secure layers:
        </p>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-800 text-[11px]">1</span>
              <span>Repo Governance (Pure)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>protect-branch.yml</strong>: Configures approvals, status checks, and linear history. Requires zero cloud credentials and zero OIDC tokens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-950 flex items-center justify-center border border-indigo-800 text-[11px]">2</span>
              <span>Encrypted Secrets Storage</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>GitHub Environment Secrets</strong>: Azure IDs are injected once via <code>bootstrap.ps1</code> or Terraform into encrypted <code>prod</code> environment secrets.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-800 text-[11px]">3</span>
              <span>Consumer CI/CD Workflows</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>terraform-ci.yml</strong>: The workflow running <code>terraform plan/apply</code> uses <code>azure/login@v2</code> and requests <code>id-token: write</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Code Snippets & Implementation */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('bootstrap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'bootstrap'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              1. Secure bootstrap.ps1 (CLI Provisioning)
            </button>

            <button
              onClick={() => setActiveTab('consumer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'consumer'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              2. terraform-ci.yml (Consumer OIDC Workflow)
            </button>

            <button
              onClick={() => setActiveTab('terraform')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'terraform'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              3. Terraform IaC Alternative (GitOps)
            </button>
          </div>

          <button
            onClick={() => {
              const code =
                activeTab === 'bootstrap'
                  ? BOOTSTRAP_PS1_SCRIPT
                  : activeTab === 'consumer'
                  ? CONSUMER_CI_WORKFLOW
                  : TERRAFORM_IAC_SNIPPET;
              handleCopy(code, activeTab);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            {copiedCode === activeTab ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedCode === activeTab ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'bootstrap' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                The original YAML's input description stated: <code className="text-cyan-300">AZURE_CLIENT_ID (from bootstrap.ps1)</code>.
                Instead of pasting these IDs into workflow dispatch inputs on every run, the administrator runs this script once.
                The secrets are piped directly to <code className="text-cyan-300">gh secret set</code> and stored encrypted in GitHub's Key Vault backend.
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 whitespace-pre overflow-x-auto">
                {BOOTSTRAP_PS1_SCRIPT}
              </div>
            </div>
          )}

          {activeTab === 'consumer' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                Notice where <code className="text-cyan-300">id-token: write</code> and Azure credentials actually belong:
                inside the pull request / deployment pipeline that runs Terraform!
                It references <code className="text-cyan-300">environment: prod</code>, which automatically unlocks the encrypted secrets.
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 whitespace-pre overflow-x-auto">
                {CONSUMER_CI_WORKFLOW}
              </div>
            </div>
          )}

          {activeTab === 'terraform' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                For organizations adopting pure GitOps, you don't even need a GitHub Actions workflow to configure branch protection!
                You can manage repository branch protection and environment secrets directly via Terraform HCL using the official <code className="text-cyan-300">integrations/github</code> provider.
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 whitespace-pre overflow-x-auto">
                {TERRAFORM_IAC_SNIPPET}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
