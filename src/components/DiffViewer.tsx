import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, Split, Eye, ShieldCheck, Filter, ArrowRight } from 'lucide-react';
import { computeWorkflowDiff, DiffLine } from '../utils/diffHelper';

interface DiffViewerProps {
  originalYaml: string;
  pureYaml: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ originalYaml, pureYaml }) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showOnlyChanges, setShowOnlyChanges] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const diffLines = useMemo(() => {
    return computeWorkflowDiff(originalYaml, pureYaml);
  }, [originalYaml, pureYaml]);

  const filteredLines = useMemo(() => {
    if (!showOnlyChanges) return diffLines;
    return diffLines.filter((l) => l.type !== 'unchanged');
  }, [diffLines, showOnlyChanges]);

  const stats = useMemo(() => {
    let removed = 0;
    let modified = 0;
    diffLines.forEach((l) => {
      if (l.type === 'removed') removed++;
      if (l.type === 'modified') modified++;
    });
    return { removed, modified, total: diffLines.length };
  }, [diffLines]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pureYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pureYaml], { type: 'text/yaml' });
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
    <div className="space-y-4">
      {/* Action and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                viewMode === 'split' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Side-by-Side Diff
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                viewMode === 'unified' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Unified Diff
            </button>
          </div>

          <button
            onClick={() => setShowOnlyChanges(!showOnlyChanges)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              showOnlyChanges
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {showOnlyChanges ? 'Showing Changes Only' : 'Show Changes Only'}
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3 font-mono tabular-nums">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              -{stats.removed} lines removed
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              ~{stats.modified} refined
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Pure Pipeline
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Pure YAML'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download .yml
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Highlights of What Was Stripped */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-900/30 text-xs">
          <div className="text-rose-400 font-semibold mb-1 flex items-center gap-1.5">
            <span>1. Stripped Azure Dispatch Inputs</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Eliminated <code className="text-rose-300">azure_client_id</code>, <code className="text-rose-300">azure_tenant_id</code>, and <code className="text-rose-300">azure_subscription_id</code>. Workflow run history will never record plaintext Azure IDs.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-900/30 text-xs">
          <div className="text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
            <span>2. Scoped Down Permissions</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Dropped <code className="text-amber-300">id-token: write</code> (only needed by workflows talking to Azure OIDC) and reduced <code className="text-amber-300">contents: write</code> to <code className="text-amber-300">contents: read</code>.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-900/30 text-xs">
          <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
            <span>3. Removed Credential Side-Effects</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Removed <code className="text-cyan-300">gh secret set</code> / fallback <code className="text-cyan-300">gh variable set</code>. Branch protection now does exactly one thing: protect branches.
          </p>
        </div>
      </div>

      {/* Main Diff Code Display */}
      {viewMode === 'split' ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
          {/* Header Row */}
          <div className="grid grid-cols-2 bg-slate-900/90 border-b border-slate-800 text-xs font-semibold px-4 py-2.5">
            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Original Pipeline (Impure - Coupled with Azure OIDC Secrets)
            </div>
            <div className="flex items-center gap-2 text-emerald-400 pl-4 border-l border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Purified Pipeline (Pure - Branch Protection Governance Only)
            </div>
          </div>

          <div className="overflow-x-auto max-h-[640px] overflow-y-auto text-xs font-mono">
            <div className="divide-y divide-slate-900/50">
              {filteredLines.map((line, idx) => {
                const isRemoved = line.type === 'removed';
                const isModified = line.type === 'modified';
                const isAdded = line.type === 'added';

                return (
                  <div key={idx} className="grid grid-cols-2 hover:bg-slate-900/40 transition-colors">
                    {/* Left Column (Original) */}
                    <div
                      className={`flex items-start px-2 py-0.5 border-r border-slate-800 ${
                        isRemoved
                          ? 'bg-rose-950/40 text-rose-300'
                          : isModified
                          ? 'bg-amber-950/30 text-amber-300'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-600 tabular-nums">
                        {line.leftLineNumber ?? ''}
                      </span>
                      <span className="w-4 shrink-0 text-center select-none font-bold">
                        {isRemoved ? '-' : isModified ? '~' : ''}
                      </span>
                      <span className="whitespace-pre overflow-x-visible break-all flex-1">
                        {line.leftContent}
                      </span>
                    </div>

                    {/* Right Column (Pure) */}
                    <div
                      className={`flex items-start px-2 py-0.5 ${
                        isAdded
                          ? 'bg-emerald-950/40 text-emerald-300'
                          : isModified
                          ? 'bg-emerald-950/30 text-emerald-300'
                          : isRemoved
                          ? 'bg-slate-950 text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-600 tabular-nums">
                        {line.rightLineNumber ?? ''}
                      </span>
                      <span className="w-4 shrink-0 text-center select-none font-bold">
                        {isAdded ? '+' : isModified ? '~' : ''}
                      </span>
                      <span className="whitespace-pre overflow-x-visible break-all flex-1">
                        {line.rightContent}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
          <div className="bg-slate-900/90 border-b border-slate-800 text-xs font-semibold px-4 py-2.5 text-slate-300 flex items-center justify-between">
            <span>Unified Diff View</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Red (-) indicates removed impurity · Green (+) indicates clean pure workflow
            </span>
          </div>

          <div className="overflow-x-auto max-h-[640px] overflow-y-auto text-xs font-mono divide-y divide-slate-900/40">
            {filteredLines.map((line, idx) => {
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="flex items-start px-3 py-0.5 bg-rose-950/35 text-rose-300">
                    <span className="w-10 shrink-0 text-right pr-3 select-none text-rose-500 tabular-nums">
                      {line.leftLineNumber}
                    </span>
                    <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-700 tabular-nums">-</span>
                    <span className="w-5 shrink-0 text-center select-none font-bold text-rose-400">-</span>
                    <span className="whitespace-pre flex-1">{line.leftContent}</span>
                    {line.reason && (
                      <span className="text-[10px] text-rose-400/80 bg-rose-900/30 px-1.5 py-0.5 rounded ml-2 select-none shrink-0">
                        {line.reason}
                      </span>
                    )}
                  </div>
                );
              }

              if (line.type === 'added') {
                return (
                  <div key={idx} className="flex items-start px-3 py-0.5 bg-emerald-950/35 text-emerald-300">
                    <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-700 tabular-nums">-</span>
                    <span className="w-10 shrink-0 text-right pr-3 select-none text-emerald-500 tabular-nums">
                      {line.rightLineNumber}
                    </span>
                    <span className="w-5 shrink-0 text-center select-none font-bold text-emerald-400">+</span>
                    <span className="whitespace-pre flex-1">{line.rightContent}</span>
                  </div>
                );
              }

              if (line.type === 'modified') {
                return (
                  <React.Fragment key={idx}>
                    <div className="flex items-start px-3 py-0.5 bg-rose-950/25 text-rose-300/80">
                      <span className="w-10 shrink-0 text-right pr-3 select-none text-rose-500/70 tabular-nums">
                        {line.leftLineNumber}
                      </span>
                      <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-700 tabular-nums">-</span>
                      <span className="w-5 shrink-0 text-center select-none font-bold text-rose-400">-</span>
                      <span className="whitespace-pre flex-1">{line.leftContent}</span>
                    </div>
                    <div className="flex items-start px-3 py-0.5 bg-emerald-950/35 text-emerald-300">
                      <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-700 tabular-nums">-</span>
                      <span className="w-10 shrink-0 text-right pr-3 select-none text-emerald-500 tabular-nums">
                        {line.rightLineNumber}
                      </span>
                      <span className="w-5 shrink-0 text-center select-none font-bold text-emerald-400">+</span>
                      <span className="whitespace-pre flex-1">{line.rightContent}</span>
                      {line.reason && (
                        <span className="text-[10px] text-emerald-400/80 bg-emerald-900/30 px-1.5 py-0.5 rounded ml-2 select-none shrink-0">
                          {line.reason}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              }

              return (
                <div key={idx} className="flex items-start px-3 py-0.5 text-slate-400 hover:bg-slate-900/30">
                  <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-600 tabular-nums">
                    {line.leftLineNumber}
                  </span>
                  <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-600 tabular-nums">
                    {line.rightLineNumber}
                  </span>
                  <span className="w-5 shrink-0 text-center select-none text-slate-700"> </span>
                  <span className="whitespace-pre flex-1">{line.rightContent}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
