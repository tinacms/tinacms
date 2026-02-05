/**
 * Editorial Workflow Status Constants
 * These match the server-side constants in tinacloud/js/content-api/src/editorial-workflow.ts
 */

export const EDITORIAL_WORKFLOW_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  SETTING_UP: 'setting_up',
  CREATING_BRANCH: 'creating_branch',
  INDEXING: 'indexing',
  CONTENT_GENERATION: 'content_generation',
  CREATING_PR: 'creating_pr',
  COMPLETE: 'complete',
  ERROR: 'error',
  TIMEOUT: 'timeout',
} as const;

export type EditorialWorkflowStatus =
  (typeof EDITORIAL_WORKFLOW_STATUS)[keyof typeof EDITORIAL_WORKFLOW_STATUS];

/**
 * Editorial Workflow Error Codes
 * These match the server-side constants in tinacloud/common/src/editorial-workflow-constants.ts
 */
export const EDITORIAL_WORKFLOW_ERROR = {
  BRANCH_EXISTS: 'BRANCH_EXISTS',
  BRANCH_HIERARCHY_CONFLICT: 'BRANCH_HIERARCHY_CONFLICT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  BRANCH_NOT_FOUND: 'BRANCH_NOT_FOUND',
} as const;

export type EditorialWorkflowError =
  (typeof EDITORIAL_WORKFLOW_ERROR)[keyof typeof EDITORIAL_WORKFLOW_ERROR];

/**
 * Error type for editorial workflow operations with additional error details
 */
export type EditorialWorkflowErrorDetails = Error & {
  errorCode?: string;
  conflictingBranch?: string;
  branchName?: string;
};

/**
 * Custom error class for branch not found scenarios
 * Used when a save operation fails because the branch has been merged or deleted
 */
export class BranchNotFoundError extends Error {
  errorCode = EDITORIAL_WORKFLOW_ERROR.BRANCH_NOT_FOUND;
  branchName: string;

  constructor(message: string, branchName: string) {
    super(message);
    this.name = 'BranchNotFoundError';
    this.branchName = branchName;
  }
}
