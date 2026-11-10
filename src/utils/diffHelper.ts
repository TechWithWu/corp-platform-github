export interface DiffLine {
  type: 'unchanged' | 'removed' | 'added' | 'modified';
  leftLineNumber?: number;
  rightLineNumber?: number;
  leftContent?: string;
  rightContent?: string;
  annotation?: string;
  reason?: string;
}

export function computeWorkflowDiff(originalText: string, purifiedText: string): DiffLine[] {
  const originalLines = originalText.split('\n');
  const purifiedLines = purifiedText.split('\n');

  const diff: DiffLine[] = [];

  let origIdx = 0;
  let pureIdx = 0;

  // Key landmarks in original:
  // - inputs block: lines with azure_client_id, azure_tenant_id, azure_subscription_id, setup_environments
  // - permissions: id-token: write, contents: write -> contents: read
  // - steps: Mask Azure OIDC Inputs, Setup Environments for Azure OIDC, Store Azure Credentials in Environment
  // - execution summary: removed azure credential rows and undefined inputs

  while (origIdx < originalLines.length || pureIdx < purifiedLines.length) {
    const orig = originalLines[origIdx];
    const pure = purifiedLines[pureIdx];

    if (orig !== undefined && pure !== undefined && orig === pure) {
      diff.push({
        type: 'unchanged',
        leftLineNumber: origIdx + 1,
        rightLineNumber: pureIdx + 1,
        leftContent: orig,
        rightContent: pure,
      });
      origIdx++;
      pureIdx++;
      continue;
    }

    // Check for removed blocks:
    if (orig !== undefined) {
      const isRemovedInput = 
        orig.includes('azure_client_id:') ||
        orig.includes('azure_tenant_id:') ||
        orig.includes('azure_subscription_id:') ||
        orig.includes('setup_environments:') ||
        orig.includes("description: 'AZURE_CLIENT_ID") ||
        orig.includes("description: 'AZURE_TENANT_ID") ||
        orig.includes("description: 'AZURE_SUBSCRIPTION_ID") ||
        orig.includes("description: 'Provision GitHub Environments") ||
        (orig.trim() === "default: ''" && origIdx > 10 && origIdx < 30) ||
        (orig.trim() === "required: false" && origIdx > 10 && origIdx < 30) ||
        (orig.trim() === "type: string" && origIdx > 10 && origIdx < 30) ||
        (orig.trim() === "default: true" && origIdx > 70 && origIdx < 80) ||
        (orig.trim() === "type: boolean" && origIdx > 70 && origIdx < 80);

      const isRemovedPermission = orig.trim() === 'id-token: write';

      const isModifiedPermission = orig.trim() === 'contents: write' && pure?.trim() === 'contents: read';

      const isRemovedJobName = orig.includes("name: 'Apply Terraform Branch Protection & Store Secrets'") && 
                               pure?.includes("name: 'Apply Terraform Branch Protection'");

      const isRemovedStep = 
        orig.includes("name: 'Mask Azure OIDC Inputs'") ||
        orig.includes("::add-mask::") ||
        orig.includes("inputs.azure_client_id") ||
        orig.includes("inputs.azure_tenant_id") ||
        orig.includes("inputs.azure_subscription_id") ||
        orig.includes("name: 'Setup Environments for Azure OIDC'") ||
        orig.includes("inputs.setup_environments") ||
        orig.includes("createOrUpdateEnvironment") ||
        orig.includes("Environment '") ||
        orig.includes("name: 'Store Azure Credentials in Environment'") ||
        orig.includes("Configuring Azure OIDC credentials") ||
        orig.includes("gh secret set AZURE_") ||
        orig.includes("gh variable set AZURE_") ||
        orig.includes("AZ_CLIENT_ID:") ||
        orig.includes("AZ_TENANT_ID:") ||
        orig.includes("AZ_SUB_ID:") ||
        orig.includes("TARGET_ENV:") ||
        orig.includes("ALSO_PROD:") ||
        orig.includes("inputs.also_store_in_production") ||
        orig.includes("inputs.target_environment") ||
        orig.includes("Azure Client ID Provided") ||
        orig.includes("Azure Tenant ID Provided") ||
        orig.includes("Azure Subscription ID Provided") ||
        orig.includes("Credentials in Environment") ||
        orig.includes("The Azure OIDC parameters");

      if (isModifiedPermission) {
        diff.push({
          type: 'modified',
          leftLineNumber: origIdx + 1,
          rightLineNumber: pureIdx + 1,
          leftContent: orig,
          rightContent: pure,
          reason: 'Downgraded from write to read (Principle of Least Privilege)',
        });
        origIdx++;
        pureIdx++;
        continue;
      }

      if (isRemovedJobName) {
        diff.push({
          type: 'modified',
          leftLineNumber: origIdx + 1,
          rightLineNumber: pureIdx + 1,
          leftContent: orig,
          rightContent: pure,
          reason: 'Removed credential storage scope from job name',
        });
        origIdx++;
        pureIdx++;
        continue;
      }

      // If this line in original doesn't exist in pure at all
      if (isRemovedInput || isRemovedPermission || isRemovedStep) {
        diff.push({
          type: 'removed',
          leftLineNumber: origIdx + 1,
          leftContent: orig,
          rightContent: '',
          reason: isRemovedInput ? 'Removed Azure secret from workflow inputs' :
                  isRemovedPermission ? 'Removed redundant OIDC permission' :
                  'Removed Azure secret masking & injection side-effects',
        });
        origIdx++;
        continue;
      }
    }

    // Default fallback line matching
    if (orig !== undefined && (pure === undefined || !purifiedLines.slice(pureIdx, pureIdx + 5).includes(orig))) {
      diff.push({
        type: 'removed',
        leftLineNumber: origIdx + 1,
        leftContent: orig,
        rightContent: '',
      });
      origIdx++;
    } else if (pure !== undefined && (orig === undefined || !originalLines.slice(origIdx, origIdx + 5).includes(pure))) {
      diff.push({
        type: 'added',
        rightLineNumber: pureIdx + 1,
        leftContent: '',
        rightContent: pure,
      });
      pureIdx++;
    } else {
      diff.push({
        type: 'modified',
        leftLineNumber: origIdx + 1,
        rightLineNumber: pureIdx + 1,
        leftContent: orig,
        rightContent: pure,
      });
      origIdx++;
      pureIdx++;
    }
  }

  return diff;
}
