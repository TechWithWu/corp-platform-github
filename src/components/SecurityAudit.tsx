import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Lock, Key, Server, FileText, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SECURITY_AUDIT_ISSUES, AuditIssue } from '../data/workflowData';

export const SecurityAudit: React.FC = () => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>('dispatch-secrets');

  const toggleIssue = (id: string) => {
    setExpandedIssue(expandedIssue === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              Security & Architectural Audit Report
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Why Removing Azure Credentials Makes Your Pipeline Pure & Secure
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
              Branch protection is a governance policy that operates purely within GitHub repository administration.
              Coupling it with cloud credential ingestion introduced high-severity disclosure vulnerabilities, overprivileged tokens, and fragile side-effects.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 shrink-0">
            <div className="text-center px-2">
              <div className="text-2xl font-bold font-mono tabular-nums text-rose-400">0</div>
              <div className="text-[11px] text-slate-500">Critical Risks Left</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">100%</div>
              <div className="text-[11px] text-slate-500">Purity Rating</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">2</div>
              <div className="text-[11px] text-slate-500">Scattered Concerns Decoupled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 text-sm font-semibold text-slate-200">
          Architecture Comparison: Original (Impure) vs. Purified Pipeline
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Dimension</th>
                <th className="py-3 px-4 text-rose-300">Original Workflow (Coupled)</th>
                <th className="py-3 px-4 text-emerald-300">Purified Workflow (Single Purpose)</th>
                <th className="py-3 px-4">Standard & Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Secret Confidentiality</td>
                <td className="py-3 px-4 text-rose-400 flex items-start gap-1.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                  Plaintext in Run Details (workflow_dispatch inputs are logged in GitHub UI)
                </td>
                <td className="py-3 px-4 text-emerald-400">
                  <span className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                    Zero secrets accepted via UI; configured out-of-band in GitHub Secrets
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">CWE-532 / OWASP CI/CD Top 10</td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Plaintext Fallback Risk</td>
                <td className="py-3 px-4 text-rose-400 flex items-start gap-1.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                  Calls <code className="bg-rose-950/50 px-1 py-0.5 rounded text-[11px]">gh variable set</code> writing secrets into plaintext public repo variables!
                </td>
                <td className="py-3 px-4 text-emerald-400">
                  <span className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                    Eliminated all credential mutation commands entirely
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">CWE-312 Cleartext Storage</td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Least Privilege (Permissions)</td>
                <td className="py-3 px-4 text-amber-400 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  Overprivileged: <code className="bg-slate-950 px-1 py-0.5 rounded text-[11px]">id-token: write</code> and <code className="bg-slate-950 px-1 py-0.5 rounded text-[11px]">contents: write</code>
                </td>
                <td className="py-3 px-4 text-emerald-400">
                  <span className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                    Strictly scoped: <code className="bg-emerald-950/40 text-emerald-300 px-1 py-0.5 rounded text-[11px]">administration: write</code> + <code className="bg-emerald-950/40 text-emerald-300 px-1 py-0.5 rounded text-[11px]">contents: read</code>
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">GitHub Actions Security Hardening</td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Determinism & Automation</td>
                <td className="py-3 px-4 text-slate-400">
                  Fragile: Operator must copy-paste Azure IDs on every dispatch run
                </td>
                <td className="py-3 px-4 text-emerald-400">
                  <span className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                    Pure & Idempotent: Can run on-demand or automated in GitOps loops
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">Single Responsibility Principle (SRP)</td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-200">Execution Summary Integrity</td>
                <td className="py-3 px-4 text-slate-400">
                  Reported ghost variable <code className="bg-slate-950 px-1 py-0.5 rounded text-[11px]">inputs.target_environment</code> not declared in YAML
                </td>
                <td className="py-3 px-4 text-emerald-400">
                  <span className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                    Clean markdown summary strictly reporting verified branch protection policies
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">CI/CD Schema Validation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Issues Accordion */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 px-1">
          Detailed Vulnerability & Anti-Pattern Analysis
        </h3>

        {SECURITY_AUDIT_ISSUES.map((issue) => {
          const isOpen = expandedIssue === issue.id;
          const isCritical = issue.severity === 'CRITICAL';
          const isHigh = issue.severity === 'HIGH';

          return (
            <div
              key={issue.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleIssue(issue.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isHigh
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{issue.title}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{issue.category}</span>
                      {issue.cwe && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[11px] text-slate-400">{issue.cwe}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-3 text-xs leading-relaxed">
                  <div>
                    <div className="font-semibold text-rose-400 mb-1">The Problem:</div>
                    <p className="text-slate-300">{issue.problem}</p>
                  </div>

                  <div>
                    <div className="font-semibold text-emerald-400 mb-1">How Making The Pipeline Pure Resolves This:</div>
                    <p className="text-slate-300">{issue.solution}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-400">
                    <span className="font-mono text-[11px] text-cyan-400">
                      Removed Target: {issue.linesRemoved}
                    </span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cleansed in Pure Workflow
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
