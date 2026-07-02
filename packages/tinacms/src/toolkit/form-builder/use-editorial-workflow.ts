import * as React from 'react';
import { ERR_BRANCH_CONFLICT, ERR_BRANCH_EXISTS } from '@tinacms/schema-tools';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { useCMS } from '../react-core';
import {
  EDITORIAL_WORKFLOW_ERROR,
  EDITORIAL_WORKFLOW_STATUS,
  EditorialWorkflowErrorDetails,
} from './editorial-workflow-constants';
import {
  CREATE_DOCUMENT_GQL,
  DELETE_DOCUMENT_GQL,
  UPDATE_DOCUMENT_GQL,
} from '../../admin/api';
import { Form } from '@toolkit/forms';
import {
  checkTargetBranchExists,
  getEditorialWorkflowPrTitle,
  TARGET_BRANCH_EXISTS_ERROR,
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
];

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
}

export interface UseEditorialWorkflowResult {
  isExecuting: boolean;
  errorMessage: string;
  currentStep: number;
  elapsedTime: number;
  /** Resolves with the outcome; on failure `error` holds the message. */
  executeWorkflow: (
    opts: ExecuteWorkflowOptions
  ) => Promise<{ success: boolean; error?: string }>;
  /** Reset error/executing state so the form can be retried */
  reset: () => void;
}

export const getEditorialWorkflowErrorMessage = (e: unknown): string => {
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

  return errMessage;
};

export function useEditorialWorkflow(): UseEditorialWorkflowResult {
  const cms = useCMS();
  const tinaApi = cms.api.tina;
  const { setCurrentBranch } = useBranchData();

  const [isExecuting, setIsExecuting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(0);
  const [elapsedTime, setElapsedTime] = React.useState(0);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isExecuting && currentStep > 0) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExecuting, currentStep]);

  const reset = () => {
    setErrorMessage('');
    setIsExecuting(false);
    setCurrentStep(0);
  };

  const executeWorkflow = async ({
    branchName,
    baseBranch,
    path,
    values,
    crudType,
    tinaForm,
    signal,
    isDraft,
  }: ExecuteWorkflowOptions): Promise<{ success: boolean; error?: string }> => {
    try {
      if (signal?.aborted) return { success: false };

      const targetBranchExists = await checkTargetBranchExists(
        tinaApi,
        branchName,
        'executeEditorialWorkflow',
        signal
      );

      if (signal?.aborted) return { success: false };

      if (targetBranchExists) {
        setErrorMessage(TARGET_BRANCH_EXISTS_ERROR);
        setIsExecuting(false);
        setCurrentStep(0);
        return { success: false, error: TARGET_BRANCH_EXISTS_ERROR };
      }

      setIsExecuting(true);
      setCurrentStep(1);

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
              setCurrentStep(1);
              break;
            case EDITORIAL_WORKFLOW_STATUS.INDEXING:
              setCurrentStep(2);
              break;
            case EDITORIAL_WORKFLOW_STATUS.CONTENT_GENERATION:
            case EDITORIAL_WORKFLOW_STATUS.CREATING_PR:
              setCurrentStep(3);
              break;
            case EDITORIAL_WORKFLOW_STATUS.COMPLETE:
              setCurrentStep(4);
              break;
          }
        },
      });

      if (!result.branchName) {
        throw new Error('Branch creation failed.');
      }

      setCurrentBranch(result.branchName);

      if (result.warning) {
        cms.alerts.warn(
          `${result.warning} Please reconnect GitHub authoring here: ${tinaApi.gitSettingsLink}`,
          0
        );
      }

      cms.alerts.success(
        `Branch created successfully - Pull Request at ${result.pullRequestUrl}`,
        0
      );

      if (crudType === 'create') {
        const folderPath = relativePath.includes('/')
          ? relativePath.substring(0, relativePath.lastIndexOf('/'))
          : '';
        window.location.hash = `#/collections/${collection.name}${
          folderPath ? `/${folderPath}` : ''
        }`;
      }

      return { success: true };
    } catch (e: unknown) {
      console.error(e);
      const errMessage = getEditorialWorkflowErrorMessage(e);

      setErrorMessage(errMessage);
      setIsExecuting(false);
      setCurrentStep(0);

      return { success: false, error: errMessage };
    }
  };

  return {
    isExecuting,
    errorMessage,
    currentStep,
    elapsedTime,
    executeWorkflow,
    reset,
  };
}
