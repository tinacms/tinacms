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

export const checkBaseBranchExists = async (
  tinaApi: { branchExists: (branchName: string) => Promise<boolean> },
  baseBranch: string,
  debugLabel: string
): Promise<boolean> => {
  try {
    console.debug(
      `[tina:branch-guard] ${debugLabel}: checking base branch:`,
      baseBranch
    );
    const exists = await tinaApi.branchExists(baseBranch);
    console.debug(
      `[tina:branch-guard] ${debugLabel}: base branch exists?`,
      exists
    );
    return exists;
  } catch (err) {
    console.error(
      `[tina:branch-guard] ${debugLabel}: branchExists threw, failing open:`,
      err
    );
    return true;
  }
};
