import type { Form } from '@toolkit/forms';
import type { TinaCMS } from '@toolkit/tina-cms';
import {
  CREATE_DOCUMENT_GQL,
  DELETE_DOCUMENT_GQL,
  UPDATE_DOCUMENT_GQL,
} from '../../admin/api';
import { EDITORIAL_WORKFLOW_STATUS } from './editorial-workflow-constants';
import {
  type EditorialWorkflowErrorCopy,
  TARGET_BRANCH_EXISTS_ERROR,
  checkTargetBranchExists,
  collectionLabelResolver,
  getEditorialWorkflowError,
  getEditorialWorkflowPrTitle,
  plainMessage,
} from './editorial-workflow-utils';

const pathRelativeToCollection = (
  collectionPath: string,
  fullPath: string
): string => {
  const normalizedCollectionPath = collectionPath.replace(/\\/g, '/');
  const normalizedFullPath = fullPath.replace(/\\/g, '/');
  const collectionPathWithSlash = normalizedCollectionPath.endsWith('/')
    ? normalizedCollectionPath
    : normalizedCollectionPath + '/';
  if (normalizedFullPath.startsWith(collectionPathWithSlash)) {
    return normalizedFullPath.substring(collectionPathWithSlash.length);
  }
  throw new Error(
    `Path ${fullPath} not within collection path ${collectionPath}`
  );
};

const getEditorialWorkflowMutation = (crudType: string): string => {
  if (crudType === 'create') {
    return CREATE_DOCUMENT_GQL;
  }
  if (crudType === 'delete') {
    return DELETE_DOCUMENT_GQL;
  }
  if (crudType !== 'view') {
    return UPDATE_DOCUMENT_GQL;
  }
  return '';
};

export const WORKFLOW_STEPS = [
  { id: 1, name: 'Creating branch', description: 'Setting up workspace' },
  { id: 2, name: 'Updating branch', description: 'Syncing content to branch' },
  { id: 3, name: 'Creating pull request', description: 'Preparing for review' },
] as const;

export const WORKFLOW_ESTIMATE = 'Estimated time: 1-2 min';

export type WorkflowStep = 1 | 2 | 3 | 4;

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export interface ExecuteWorkflowOptions {
  branchName: string;
  baseBranch: string;
  path: string;
  values: Record<string, unknown>;
  crudType: string;
  tinaForm?: Form;
  signal?: AbortSignal;
  // When false, opens a ready-for-review PR. Omitted keeps the server's draft-first default.
  isDraft?: boolean;
  targetBranchExists?: boolean;
}

export type EditorialWorkflowOutcome =
  | { status: 'aborted' }
  | { status: 'failed'; started: boolean; error: EditorialWorkflowErrorCopy }
  | {
      status: 'succeeded';
      branchName: string;
      pullRequestUrl?: string;
      warning?: string;
      redirectHash?: string;
    };

export async function runEditorialWorkflow(
  cms: TinaCMS,
  {
    branchName,
    baseBranch,
    path,
    values,
    crudType,
    tinaForm,
    signal,
    isDraft,
    targetBranchExists: precomputedTargetBranchExists,
    onStart,
    onStep,
  }: ExecuteWorkflowOptions & {
    onStart: () => void;
    onStep: (step: WorkflowStep) => void;
  }
): Promise<EditorialWorkflowOutcome> {
  const tinaApi = cms.api.tina;
  let started = false;
  try {
    if (signal?.aborted) return { status: 'aborted' };

    const targetBranchExists =
      precomputedTargetBranchExists ??
      (await checkTargetBranchExists(
        tinaApi,
        branchName,
        'executeEditorialWorkflow',
        signal
      ));

    if (signal?.aborted) return { status: 'aborted' };

    if (targetBranchExists) {
      return {
        status: 'failed',
        started,
        error: { messageParts: plainMessage(TARGET_BRANCH_EXISTS_ERROR) },
      };
    }

    started = true;
    onStart();

    const graphql = getEditorialWorkflowMutation(crudType);

    const collection = tinaApi.schema.getCollectionByFullPath(path);

    let submittedValues = values;
    if (collection?.ui?.beforeSubmit) {
      const valOverride = await collection.ui.beforeSubmit({
        cms,
        values,
        form: tinaForm,
      });
      if (valOverride) {
        submittedValues = valOverride;
      }
    }

    const params = tinaApi.schema.transformPayload(
      collection.name,
      submittedValues
    );
    const relativePath = pathRelativeToCollection(collection.path, path);

    const result = await tinaApi.executeEditorialWorkflow({
      branchName,
      baseBranch,
      prTitle: getEditorialWorkflowPrTitle(branchName),
      isDraft,
      graphQLContentOp: {
        query: graphql,
        variables: {
          collection: collection.name,
          relativePath,
          params,
        },
      },
      onStatusUpdate: (status) => {
        switch (status.status) {
          case EDITORIAL_WORKFLOW_STATUS.SETTING_UP:
          case EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH:
            onStep(1);
            break;
          case EDITORIAL_WORKFLOW_STATUS.INDEXING:
            onStep(2);
            break;
          case EDITORIAL_WORKFLOW_STATUS.CONTENT_GENERATION:
          case EDITORIAL_WORKFLOW_STATUS.CREATING_PR:
            onStep(3);
            break;
          case EDITORIAL_WORKFLOW_STATUS.COMPLETE:
            onStep(4);
            break;
        }
      },
    });

    if (!result.branchName) {
      throw new Error('Branch creation failed.');
    }

    let redirectHash: string | undefined;
    if (crudType === 'create') {
      const folderPath = relativePath.includes('/')
        ? relativePath.substring(0, relativePath.lastIndexOf('/'))
        : '';
      redirectHash = `#/collections/${collection.name}${
        folderPath ? `/${folderPath}` : ''
      }`;
    }

    return {
      status: 'succeeded',
      branchName: result.branchName,
      pullRequestUrl: result.pullRequestUrl,
      warning: result.warning,
      redirectHash,
    };
  } catch (e: unknown) {
    console.error(e);
    return {
      status: 'failed',
      started,
      error: getEditorialWorkflowError(
        e,
        collectionLabelResolver(cms.api.tina.schema)
      ),
    };
  }
}
