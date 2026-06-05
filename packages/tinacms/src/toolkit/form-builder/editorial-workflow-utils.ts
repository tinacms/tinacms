export interface MediaWorkflowConfirmBranchEvent {
  type: 'media:workflow:confirm-branch';
  branchName: string;
  baseBranch: string;
  onConfirm: (branchName: string) => Promise<void>;
  onCancel: () => void;
  onSaveToProtectedBranch: () => void;
}

export const getEditorialWorkflowPrTitle = (branchName: string): string =>
  `${branchName.replace('tina/', '').replaceAll('-', ' ')} (PR from TinaCMS)`;

export const TARGET_BRANCH_EXISTS_ERROR =
  'A branch with this name already exists';

const checkBranchExists = async (
  tinaApi: {
    branchExists: (
      branchName: string,
      args?: { signal?: AbortSignal }
    ) => Promise<boolean>;
  },
  branchName: string,
  debugLabel: string,
  branchType: 'base' | 'target',
  fallback: boolean,
  signal?: AbortSignal
): Promise<boolean> => {
  try {
    console.debug(
      `[tina:branch-guard] ${debugLabel}: checking ${branchType} branch:`,
      branchName
    );
    const exists = await tinaApi.branchExists(branchName, { signal });
    console.debug(
      `[tina:branch-guard] ${debugLabel}: ${branchType} branch exists?`,
      exists
    );
    return exists;
  } catch (err) {
    if (signal?.aborted) return fallback;
    console.error(
      `[tina:branch-guard] ${debugLabel}: branchExists threw, failing open:`,
      err
    );
    return fallback;
  }
};

export const checkBaseBranchExists = async (
  tinaApi: {
    branchExists: (
      branchName: string,
      args?: { signal?: AbortSignal }
    ) => Promise<boolean>;
  },
  baseBranch: string,
  debugLabel: string,
  signal?: AbortSignal
): Promise<boolean> =>
  checkBranchExists(tinaApi, baseBranch, debugLabel, 'base', true, signal);

export const checkTargetBranchExists = async (
  tinaApi: {
    branchExists: (
      branchName: string,
      args?: { signal?: AbortSignal }
    ) => Promise<boolean>;
  },
  targetBranch: string,
  debugLabel: string,
  signal?: AbortSignal
): Promise<boolean> =>
  checkBranchExists(tinaApi, targetBranch, debugLabel, 'target', false, signal);
