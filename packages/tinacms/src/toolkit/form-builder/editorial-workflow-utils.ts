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

export interface BranchGuardResult {
  baseBranchExists: boolean;
  targetBranchExists: boolean;
}

export const checkBranchGuard = async (
  tinaApi: {
    branchesExist: (
      branchNames: string[],
      args?: { signal?: AbortSignal }
    ) => Promise<Record<string, boolean>>;
  },
  baseBranch: string,
  targetBranch: string,
  debugLabel: string,
  signal?: AbortSignal
): Promise<BranchGuardResult> => {
  try {
    console.debug(
      `[tina:branch-guard] ${debugLabel}: checking base + target branches:`,
      baseBranch,
      targetBranch
    );
    const existence = await tinaApi.branchesExist([baseBranch, targetBranch], {
      signal,
    });
    const result = {
      baseBranchExists: existence[baseBranch] ?? true,
      targetBranchExists: existence[targetBranch] ?? false,
    };
    console.debug(
      `[tina:branch-guard] ${debugLabel}: base exists?`,
      result.baseBranchExists,
      'target exists?',
      result.targetBranchExists
    );
    return result;
  } catch (err) {
    if (!signal?.aborted) {
      console.error(
        `[tina:branch-guard] ${debugLabel}: branchesExist threw, failing open:`,
        err
      );
    }
    return { baseBranchExists: true, targetBranchExists: false };
  }
};
