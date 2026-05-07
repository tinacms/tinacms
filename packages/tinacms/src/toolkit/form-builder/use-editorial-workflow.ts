import * as React from 'react';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { useCMS } from '../react-core';
import {
  EDITORIAL_WORKFLOW_STATUS,
  EDITORIAL_WORKFLOW_ERROR,
  EditorialWorkflowErrorDetails,
} from './editorial-workflow-constants';
import {
  CREATE_DOCUMENT_GQL,
  DELETE_DOCUMENT_GQL,
  UPDATE_DOCUMENT_GQL,
} from '../../admin/api';
import { Form } from '@toolkit/forms';

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
}

export interface UseEditorialWorkflowResult {
  isExecuting: boolean;
  errorMessage: string;
  currentStep: number;
  elapsedTime: number;
  /** Returns true on success, false on failure (error captured in errorMessage) */
  executeWorkflow: (opts: ExecuteWorkflowOptions) => Promise<boolean>;
  /** Reset error/executing state so the form can be retried */
  reset: () => void;
}

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
  }: ExecuteWorkflowOptions): Promise<boolean> => {
    try {
      setIsExecuting(true);
      setCurrentStep(1);

      let graphql = '';
      if (crudType === 'create') {
        graphql = CREATE_DOCUMENT_GQL;
      } else if (crudType === 'delete') {
        graphql = DELETE_DOCUMENT_GQL;
      } else if (crudType !== 'view') {
        graphql = UPDATE_DOCUMENT_GQL;
      }

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
        prTitle: `${branchName.replace('tina/', '').replace('-', ' ')} (PR from TinaCMS)`,
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

      return true;
    } catch (e: unknown) {
      console.error(e);
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
        if (err.message.toLowerCase().includes('already exists')) {
          errMessage = 'A branch with this name already exists';
        } else if (err.message.toLowerCase().includes('conflict')) {
          errMessage = err.message;
        }
      }

      setErrorMessage(errMessage);
      setIsExecuting(false);
      setCurrentStep(0);

      return false;
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
