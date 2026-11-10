import React, { useState } from 'react';
import { Play, CheckCircle2, Clock, GitBranch, Shield, Terminal, ArrowRight, RotateCcw } from 'lucide-react';

export const WorkflowSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [branch, setBranch] = useState('main');
  const [approvals, setApprovals] = useState('1');
  const [checks, setChecks] = useState('Terraform Unit Tests, Terraform Plan');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [octokitPayload, setOctokitPayload] = useState<any | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const steps = [
    { name: 'Checkout Repository', tool: 'actions/checkout@v4', duration: '1s' },
    { name: 'Verify Token & Configure Branch Protection', tool: 'actions/github-script@v7', duration: '2s' },
    { name: 'Generate Execution Summary', tool: 'cat >> $GITHUB_STEP_SUMMARY', duration: '1s' },
  ];

  const runSimulation = () => {
    setIsRunning(true);
    setCurrentStep(1);
    setHasCompleted(false);
    setExecutionLogs(['[info] Starting job: apply-branch-protection on runner ubuntu-latest']);

    setTimeout(() => {
      setExecutionLogs((prev) => [
        ...prev,
        '[info] Step 1/3: actions/checkout@v4 completed. Repository HEAD at refs/heads/' + branch,
      ]);
      setCurrentStep(2);

      const payload = {
        owner: 'acme-corp',
        repo: 'platform-infrastructure',
        branch: branch,
        required_status_checks: {
          strict: true,
          contexts: checks.split(',').map((s) => s.trim()).filter(Boolean),
        },
        enforce_admins: true,
        required_pull_request_reviews:
          parseInt(approvals, 10) > 0
            ? {
                dismiss_stale_reviews: true,
                require_code_owner_reviews: true,
                required_approving_review_count: parseInt(approvals, 10),
                require_last_push_approval: true,
              }
            : null,
        restrictions: null,
        required_linear_history: true,
        allow_force_pushes: false,
        allow_deletions: false,
        block_creations: false,
        required_conversation_resolution: true,
      };
      setOctokitPayload(payload);

      setTimeout(() => {
        setExecutionLogs((prev) => [
          ...prev,
          `[info] Configuring branch protection for acme-corp/platform-infrastructure`,
          `[info] Target Branch: ${branch}`,
          `[info] Required Status Checks: ${JSON.stringify(payload.required_status_checks.contexts)}`,
          `[info] Calling github.rest.repos.updateBranchProtection...`,
          `[success] Branch protection successfully applied. HTTP 200 OK.`,
        ]);
        setCurrentStep(3);

        setTimeout(() => {
          setExecutionLogs((prev) => [
            ...prev,
            `[info] Step 3/3: Rendered $GITHUB_STEP_SUMMARY report`,
            `[success] Job completed with 0 errors. Total time: 3.8s. (Original took ~45s due to Azure OIDC timeouts)`,
          ]);
          setIsRunning(false);
          setHasCompleted(true);
        }, 800);
      }, 1200);
    }, 1000);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setHasCompleted(false);
    setExecutionLogs([]);
    setOctokitPayload(null);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Setup Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Play className="w-3.5 h-3.5" />
              Live Workflow Dispatch Simulator
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Test-Run the Pure Workflow in a Virtual Runner
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Verify that removing Azure inputs leaves zero broken references and applies clean branch policies deterministically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-md ${
                isRunning
                  ? 'bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? 'Executing Pipeline...' : hasCompleted ? 'Run Again' : 'Dispatch Pure Workflow'}
            </button>

            {hasCompleted && (
              <button
                onClick={resetSimulation}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Dispatch Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">target_branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={isRunning}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">required_approvals</label>
            <select
              value={approvals}
              onChange={(e) => setApprovals(e.target.value)}
              disabled={isRunning}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="1">1 (Standard PR Review)</option>
              <option value="2">2 (Dual Review)</option>
              <option value="0">0 (No Review)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">required_status_checks</label>
            <input
              type="text"
              value={checks}
              onChange={(e) => setChecks(e.target.value)}
              disabled={isRunning}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Progress Pipeline & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Steps List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Steps in Job: apply-branch-protection</span>
              <span className="text-[11px] font-mono text-cyan-400">3 Clean Steps</span>
            </div>

            <div className="space-y-2 text-xs">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStep > stepNum || hasCompleted;
                const isCurrent = currentStep === stepNum && isRunning;

                return (
                  <div
                    key={step.name}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isPassed
                        ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                        : isCurrent
                        ? 'bg-cyan-950/30 border-cyan-800 text-cyan-200 animate-pulse'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                          {stepNum}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-xs text-slate-200">{step.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{step.tool}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">{step.duration}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Octokit Payload Card */}
          {octokitPayload && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">REST API Payload (Octokit)</span>
                <span className="text-[10px] font-mono text-emerald-400">updateBranchProtection</span>
              </div>
              <div className="rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto whitespace-pre">
                {JSON.stringify(octokitPayload, null, 2)}
              </div>
            </div>
          )}
        </div>

        {/* Runner Logs & Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Runner Terminal Output</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">ubuntu-latest</span>
            </div>

            <div className="rounded-lg bg-slate-950 p-3.5 font-mono text-xs text-slate-300 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1">
              {executionLogs.length === 0 ? (
                <div className="text-slate-600 italic">Click "Dispatch Pure Workflow" to test simulation...</div>
              ) : (
                executionLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('[success]')
                        ? 'text-emerald-400'
                        : log.includes('[info]')
                        ? 'text-slate-300'
                        : 'text-cyan-400'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rendered GITHUB_STEP_SUMMARY */}
          {hasCompleted && (
            <div className="p-5 rounded-xl bg-slate-900 border border-emerald-900/60 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Rendered $GITHUB_STEP_SUMMARY (Clean Report)</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-100">
                  Terraform Repository Security & Branch Protection Report
                </h3>
                <p className="text-slate-400">
                  The branch protection rules have been configured for <code className="text-cyan-300 font-bold">{branch}</code>.
                </p>

                <div className="border border-slate-800 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Security Parameter</th>
                        <th className="py-2 px-3">Configured Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-400">Target Protected Branch</td>
                        <td className="py-1.5 px-3 text-cyan-400">{branch}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-400">Required Status Checks</td>
                        <td className="py-1.5 px-3 text-slate-200">{checks}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-400">Strict Branch Up-to-Date</td>
                        <td className="py-1.5 px-3 text-emerald-400">true</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-400">Required Approvals</td>
                        <td className="py-1.5 px-3 text-cyan-400">{approvals}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-400">Linear History & Resolved Conversations</td>
                        <td className="py-1.5 px-3 text-emerald-400">Enforced</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-sans text-slate-400">Permit Force Pushes & Deletions</td>
                        <td className="py-1.5 px-3 text-rose-400">Blocked (Safe)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-slate-500 italic pt-1">
                  ✓ Note: All Azure credential rows and broken target_environment variables were purged.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
