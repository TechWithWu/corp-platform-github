import React, { useState } from 'react';
import {
  ShieldCheck,
  Split,
  Sliders,
  Terminal,
  Play,
  Wand2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Lock,
  GitBranch,
  FileCode,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ORIGINAL_WORKFLOW_YAML, PURE_WORKFLOW_YAML } from './data/workflowData';
import { DiffViewer } from './components/DiffViewer';
import { SecurityAudit } from './components/SecurityAudit';
import { Configurator } from './components/Configurator';
import { OidcGuide } from './components/OidcGuide';
import { WorkflowSimulator } from './components/WorkflowSimulator';
import { CustomPurifier } from './components/CustomPurifier';
import { GithubAsCodeViewer } from './components/GithubAsCodeViewer';

type TabType = 'githubascode' | 'diff' | 'audit' | 'config' | 'oidc' | 'simulator' | 'purifier';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('githubascode');
  const [copiedQuick, setCopiedQuick] = useState(false);

  const handleQuickCopy = () => {
    navigator.clipboard.writeText(PURE_WORKFLOW_YAML);
    setCopiedQuick(true);
    setTimeout(() => setCopiedQuick(false), 2000);
  };

  const handleQuickDownload = () => {
    const blob = new Blob([PURE_WORKFLOW_YAML], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'protect-terraform-branch-pure.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (1-line wordmark, whitespace-nowrap nav links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-900/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Pipeline Purifier
          </span>
          <span className="hidden sm:inline-block text-slate-500 text-xs font-mono">
            / GitHub Actions Governance
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('githubascode')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'githubascode' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            GitHub-as-Code (Terraform)
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'diff' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Diff & Changes
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'audit' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Security Audit
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'config' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Policy Configurator
          </button>
          <button
            onClick={() => setActiveTab('oidc')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'oidc' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            OIDC Architecture
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'simulator' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Virtual Runner
          </button>
          <button
            onClick={() => setActiveTab('purifier')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'purifier' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Custom Purifier
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleQuickCopy}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            {copiedQuick ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedQuick ? 'Copied' : 'Copy Pure YAML'}
          </button>
          <button
            onClick={handleQuickDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download .yml
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Context Breadcrumb & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Repository Root:</span>
            <code className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
              /githubascode/
            </code>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400 font-medium">Decoupled Catalog (repositories.json)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">CI/CD:</span>
            <span className="text-cyan-400 font-mono">.github/workflows/gac.yml</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">tfstate Backend:</span>
            <span className="text-emerald-400 font-mono">Azure Storage (azurerm)</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">dev Branch:</span>
            <span className="text-rose-400 font-mono">PR Only</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">prod Gate:</span>
            <span className="text-amber-400 font-mono">Manual Approval</span>
          </div>
        </div>

        {/* Tab Controls (Segmented Bar) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('githubascode')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'githubascode'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            GitHub-as-Code (Terraform)
          </button>

          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'diff'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Diff & Purification Comparison
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Security & Purity Audit
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'config'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Policy Configurator
          </button>

          <button
            onClick={() => setActiveTab('oidc')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'oidc'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Azure OIDC Architecture
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Virtual Runner Simulation
          </button>

          <button
            onClick={() => setActiveTab('purifier')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'purifier'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Purify Any YAML
          </button>
        </div>

        {/* Tab View Body */}
        <div>
          {activeTab === 'githubascode' && <GithubAsCodeViewer />}

          {activeTab === 'diff' && (
            <DiffViewer originalYaml={ORIGINAL_WORKFLOW_YAML} pureYaml={PURE_WORKFLOW_YAML} />
          )}

          {activeTab === 'audit' && <SecurityAudit />}

          {activeTab === 'config' && <Configurator />}

          {activeTab === 'oidc' && <OidcGuide />}

          {activeTab === 'simulator' && <WorkflowSimulator />}

          {activeTab === 'purifier' && <CustomPurifier />}
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Pure GitHub Actions Workflow Governance · Zero secret inputs · Least-privilege permissions
          </span>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>actions/checkout@v4</span>
            <span aria-hidden="true">·</span>
            <span>actions/github-script@v7</span>
            <span aria-hidden="true">·</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
