import { ERR_BRANCH_CONFLICT, ERR_BRANCH_EXISTS } from '@tinacms/schema-tools';
import {
  EDITORIAL_WORKFLOW_ERROR,
  EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL,
  EditorialWorkflowErrorDetails,
} from './editorial-workflow-constants';

export interface MediaWorkflowConfirmBranchEvent {
  type: 'media:workflow:confirm-branch';
  branchName: string;
  baseBranch: string;
  /** Whether the prompt may offer the direct "Save to Protected Branch" action. */
  allowSaveToProtectedBranch: boolean;
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

/** A link the CMS offers alongside an error, rendered as an anchor. */
export interface EditorialWorkflowErrorLink {
  url: string;
  label: string;
}

export interface EditorialWorkflowErrorCopy {
  message: string;
  link?: EditorialWorkflowErrorLink;
}

const indexingFailureCopy = (filepath?: string): EditorialWorkflowErrorCopy => {
  const subject = filepath ? `\u201c${filepath}\u201d` : 'your content';
  return {
    message:
      `We couldn't index ${subject}, so your changes were not saved to the new branch.\n\n` +
      'Fix the content and save again.',
    link: {
      url: EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL,
      label: 'What causes this?',
    },
  };
};

export const getEditorialWorkflowError = (
  e: unknown
): EditorialWorkflowErrorCopy => {
  let errMessage =
    'Branch operation failed. Talking to GitHub was unsuccessful, please try again. If the problem persists please contact support at https://tina.io/support 🦙';

  const err = e as EditorialWorkflowErrorDetails;

  if (err.errorCode) {
    switch (err.errorCode) {
      case EDITORIAL_WORKFLOW_ERROR.BRANCH_EXISTS:
        errMessage = 'A branch with this name already exists';
        break;
      case EDITORIAL_WORKFLOW_ERROR.BRANCH_HIERARCHY_CONFLICT:
        errMessage =
          err.message || 'Branch name conflicts with an existing branch';
        break;
      case EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED:
        errMessage = err.message || 'Invalid branch name';
        break;
      case EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED:
        return indexingFailureCopy(err.filepath);
      default:
        errMessage = err.message || errMessage;
        break;
    }
  } else if (err.message) {
    if (err.message.toLowerCase().includes(ERR_BRANCH_EXISTS)) {
      errMessage = 'A branch with this name already exists';
    } else if (err.message.toLowerCase().includes(ERR_BRANCH_CONFLICT)) {
      errMessage = err.message;
    }
  }

  return { message: errMessage };
};

export const getEditorialWorkflowErrorMessage = (e: unknown): string =>
  getEditorialWorkflowError(e).message;
