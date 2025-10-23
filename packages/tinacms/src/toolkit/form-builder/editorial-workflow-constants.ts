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
