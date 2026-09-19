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

/** A run of message text, emphasised where it names something the editor must find. */
export interface EditorialWorkflowMessagePart {
  text: string;
  emphasis?: boolean;
}

export interface EditorialWorkflowErrorCopy {
  messageParts: EditorialWorkflowMessagePart[];
  link?: EditorialWorkflowErrorLink;
}

/** One unemphasised run, for copy with nothing worth singling out. */
export const plainMessage = (text: string): EditorialWorkflowMessagePart[] => [
  { text },
];

export const messageText = (parts: EditorialWorkflowMessagePart[]): string =>
  parts.map((part) => part.text).join('');

const pageNameFrom = (file: string): string =>
  file
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/, '') || file;

const indexingFailureCopy = (
  file?: string,
  collectionLabel?: string
): EditorialWorkflowErrorCopy => {
  const subject = file ? `\u201c${pageNameFrom(file)}\u201d` : 'your content';
  const messageParts: EditorialWorkflowMessagePart[] = [
    { text: "We couldn't save your changes, because there's a problem with " },
    { text: subject, emphasis: true },
    ...(collectionLabel
      ? [{ text: ' in ' }, { text: collectionLabel, emphasis: true }]
      : []),
    { text: '.\n\nFix that page, then save again.' },
  ];
  return {
    messageParts,
    link: {
      url: EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL,
      label: 'How to resolve this',
    },
  };
};

interface CollectionLookup {
  getCollectionByFullPath?: (
    file: string
  ) => { label?: string; name?: string } | undefined;
}

// NOTE: [17 Sep 2026] EK - Always resolve from the failing file's own path, never
// from the collection being edited: indexing covers the whole branch, so the file
// that failed can belong to a different collection.
export const collectionLabelResolver =
  (schema?: CollectionLookup) =>
  (file: string): string | undefined => {
    const collection = schema?.getCollectionByFullPath?.(file);
    return collection?.label || collection?.name;
  };

export const getEditorialWorkflowError = (
  e: unknown,
  resolveCollectionLabel?: (file: string) => string | undefined
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
        return indexingFailureCopy(
          err.file,
          err.file ? resolveCollectionLabel?.(err.file) : undefined
        );
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

  return { messageParts: plainMessage(errMessage) };
};
