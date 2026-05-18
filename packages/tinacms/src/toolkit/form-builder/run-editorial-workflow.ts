import { EDITORIAL_WORKFLOW_STATUS } from './editorial-workflow-constants';

export interface EditorialWorkflowResult {
  branchName: string;
  pullRequestUrl?: string;
  warning?: string;
}

export interface RunEditorialWorkflowOptions {
  branchName: string;
  baseBranch: string;
  prTitle: string;
  graphQLContentOp?: {
    query: string;
    variables: Record<string, unknown>;
  };
  /** Called with step numbers 1..4 as the workflow progresses. */
  onStep?: (step: number) => void;
}

/**
 * Minimal shape `runEditorialWorkflow` needs from the CMS — declared
 * structurally so callers in `core/` can use this helper without pulling in
 * the full `TinaCMS` type (which would create an import cycle through
 * `@toolkit/core`).
 */
interface CmsWithTinaApi {
  api: {
    tina?: {
      executeEditorialWorkflow: (opts: {
        branchName: string;
        baseBranch: string;
        prTitle: string;
        graphQLContentOp?: RunEditorialWorkflowOptions['graphQLContentOp'];
        onStatusUpdate?: (status: { status: string }) => void;
      }) => Promise<EditorialWorkflowResult>;
    };
  };
}

/**
 * Non-React core of the editorial workflow. Wraps
 * `cms.api.tina.executeEditorialWorkflow` and maps status events to step
 * numbers so the hook (content saves) and the media store can share a
 * single implementation. Rethrows on failure; callers handle alerts / UI.
 */
export async function runEditorialWorkflow(
  cms: CmsWithTinaApi,
  {
    branchName,
    baseBranch,
    prTitle,
    graphQLContentOp,
    onStep,
  }: RunEditorialWorkflowOptions
): Promise<EditorialWorkflowResult> {
  if (!cms.api.tina) {
    throw new Error(
      'Editorial workflow requires the TinaCloud API client to be initialized.'
    );
  }
  onStep?.(1);

  const result = await cms.api.tina.executeEditorialWorkflow({
    branchName,
    baseBranch,
    prTitle,
    graphQLContentOp,
    onStatusUpdate: (status) => {
      switch (status.status) {
        case EDITORIAL_WORKFLOW_STATUS.SETTING_UP:
        case EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH:
          onStep?.(1);
          break;
        case EDITORIAL_WORKFLOW_STATUS.INDEXING:
          onStep?.(2);
          break;
        case EDITORIAL_WORKFLOW_STATUS.CONTENT_GENERATION:
        case EDITORIAL_WORKFLOW_STATUS.CREATING_PR:
          onStep?.(3);
          break;
        case EDITORIAL_WORKFLOW_STATUS.COMPLETE:
          onStep?.(4);
          break;
      }
    },
  });

  if (!result?.branchName) {
    throw new Error('Branch creation failed.');
  }

  return result;
}
