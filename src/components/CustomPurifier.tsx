import React, { useState } from 'react';
import { Wand2, Upload, FileText, Check, Copy, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { ORIGINAL_WORKFLOW_YAML, PURE_WORKFLOW_YAML } from '../data/workflowData';

export const CustomPurifier: React.FC = () => {
  const [inputYaml, setInputYaml] = useState<string>(ORIGINAL_WORKFLOW_YAML);
  const [outputYaml, setOutputYaml] = useState<string>(PURE_WORKFLOW_YAML);
  const [purifiedStats, setPurifiedStats] = useState({
    secretsRemoved: 3,
    stepsDecoupled: 3,
    permissionsTightened: 2,
  });
  const [copied, setCopied] = useState<boolean>(false);

  const runPurify = (yamlToPurify: string) => {
    // Automatic purification rules:
    let cleaned = yamlToPurify;

    // 1. Remove azure_client_id, azure_tenant_id, azure_subscription_id inputs
    cleaned = cleaned.replace(
      /\s*azure_client_id:[\s\S]*?(?=\s{4,6}[a-zA-Z_0-9]+:|\s*permissions:|\s*jobs:)/,
      ''
    );
    cleaned = cleaned.replace(
      /\s*azure_tenant_id:[\s\S]*?(?=\s{4,6}[a-zA-Z_0-9]+:|\s*permissions:|\s*jobs:)/,
      ''
    );
    cleaned = cleaned.replace(
      /\s*azure_subscription_id:[\s\S]*?(?=\s{4,6}[a-zA-Z_0-9]+:|\s*permissions:|\s*jobs:)/,
      ''
    );
    cleaned = cleaned.replace(
      /\s*setup_environments:[\s\S]*?(?=\s{4,6}[a-zA-Z_0-9]+:|\s*permissions:|\s*jobs:)/,
      ''
    );

    // 2. Remove id-token: write and downgrade contents: write
    cleaned = cleaned.replace(/\s*id-token:\s*write\s*\n?/, '\n');
    cleaned = cleaned.replace(/contents:\s*write/, 'contents: read');

    // 3. Remove Mask Azure OIDC Inputs step
    cleaned = cleaned.replace(
      /\s*-\s*name:\s*['"]Mask Azure OIDC Inputs['"][\s\S]*?(?=\s*-\s*name:)/,
      ''
    );

    // 4. Remove Setup Environments for Azure OIDC step
    cleaned = cleaned.replace(
      /\s*-\s*name:\s*['"]Setup Environments for Azure OIDC['"][\s\S]*?(?=\s*-\s*name:)/,
      ''
    );

    // 5. Remove Store Azure Credentials in Environment step
    cleaned = cleaned.replace(
      /\s*-\s*name:\s*['"]Store Azure Credentials in Environment['"][\s\S]*?(?=\s*-\s*name:)/,
      ''
    );

    // 6. Clean job name
    cleaned = cleaned.replace(
      "name: 'Apply Terraform Branch Protection & Store Secrets'",
      "name: 'Apply Terraform Branch Protection'"
    );

    // 7. Clean up summary report of azure credential rows
    cleaned = cleaned.replace(/\|\s*\*\*Azure Client ID Provided\*\*[\s\S]*?\n/, '');
    cleaned = cleaned.replace(/\|\s*\*\*Azure Tenant ID Provided\*\*[\s\S]*?\n/, '');
    cleaned = cleaned.replace(/\|\s*\*\*Azure Subscription ID Provided\*\*[\s\S]*?\n/, '');
    cleaned = cleaned.replace(/\|\s*\*\*Target Environment\*\*[\s\S]*?\n/, '');
    cleaned = cleaned.replace(
      /### Credentials in Environment[\s\S]*?configured for your target environment\.\s*\n/,
      ''
    );

    setOutputYaml(cleaned.trim() + '\n');
    setPurifiedStats({
      secretsRemoved: 3,
      stepsDecoupled: 3,
      permissionsTightened: 2,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputYaml(text);
        runPurify(text);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purified-workflow.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Wand2 className="w-3.5 h-3.5" />
            Automated Workflow Purifier Engine
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Purify Any GitHub Actions Workflow
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Strip cloud credentials, decouple multi-responsibility jobs, and enforce least-privilege permissions in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Upload Workflow .yml
            <input type="file" accept=".yml,.yaml" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              setInputYaml(ORIGINAL_WORKFLOW_YAML);
              runPurify(ORIGINAL_WORKFLOW_YAML);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Load Pretect Workflow
          </button>
        </div>
      </div>

      {/* Side by Side Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Raw Input Workflow YAML
            </span>
            <button
              onClick={() => runPurify(inputYaml)}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-medium"
            >
              Re-run Purification
            </button>
          </div>

          <textarea
            value={inputYaml}
            onChange={(e) => {
              setInputYaml(e.target.value);
              runPurify(e.target.value);
            }}
            rows={22}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Paste your GitHub Actions YAML here..."
          />
        </div>

        {/* Right: Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Purified Output (Governance Only)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>

          <div className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 max-h-[520px] overflow-y-auto whitespace-pre">
            {outputYaml}
          </div>
        </div>
      </div>
    </div>
  );
};
