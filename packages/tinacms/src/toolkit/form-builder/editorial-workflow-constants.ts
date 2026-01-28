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
} as const;

export type EditorialWorkflowError =
  (typeof EDITORIAL_WORKFLOW_ERROR)[keyof typeof EDITORIAL_WORKFLOW_ERROR];
