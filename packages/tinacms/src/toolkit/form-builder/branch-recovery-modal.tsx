import * as React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';
import { BiError, BiGitMerge, BiTrash } from 'react-icons/bi';
import { GitBranchIcon } from 'lucide-react';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { Button } from '@toolkit/styles';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import { FieldLabel } from '@toolkit/fields';
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
import { PrefixedTextField } from './create-branch-modal';

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

const formatDefaultBranchName = (branchName: string): string => {
  // Remove 'tina/' prefix if present
  let result = branchName;
  if (result.startsWith('tina/')) {
    result = result.substring(5);
  }
  return `${result}-recovery`;
};

export interface BranchRecoveryModalProps {
  close: () => void;
  onDiscard: () => void;
  path: string;
  values: Record<string, unknown>;
  crudType: string;
  missingBranchName: string;
}

export const BranchRecoveryModal = ({
  close,
  onDiscard,
  path,
  values,
  crudType,
  missingBranchName,
}: BranchRecoveryModalProps) => {
  const cms = useCMS();
  const tinaApi = cms.api.tina;
  const { setCurrentBranch } = useBranchData();
  const [disabled, setDisabled] = React.useState(false);
  const [newBranchName, setNewBranchName] = React.useState(
    formatDefaultBranchName(missingBranchName)
  );
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const steps = [
    {
      id: 1,
      name: 'Creating branch',
      description: 'Setting up workspace',
    },
    {
      id: 2,
      name: 'Saving changes',
      description: 'Syncing content to branch',
    },
    {
      id: 3,
      name: 'Creating pull request',
      description: 'Preparing for review',
    },
  ];

  const handleDiscard = () => {
    onDiscard();
    close();
  };

  const executeRecovery = async () => {
    try {
      const branchName = `tina/${newBranchName}`;
      setDisabled(true);
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
      const params = tinaApi.schema.transformPayload(collection.name, values);
      const relativePath = pathRelativeToCollection(collection.path, path);

      // Get the base branch (typically 'main')
      const baseBranch =
        tinaApi.protectedBranches[0] || 'main';

      const result = await tinaApi.executeEditorialWorkflow({
        branchName: branchName,
        baseBranch: baseBranch,
        prTitle: `${branchName.replace('tina/', '').replace('-', ' ')} (Recovered changes from TinaCMS)`,
        graphQLContentOp: {
          query: graphql,
          variables: {
            collection: collection.name,
            relativePath: relativePath,
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
            case EDITORIAL_WORKFLOW_STATUS.CONTENT_GENERATION:
              setCurrentStep(2);
              break;
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
      cms.alerts.success(
        `Changes recovered! Pull Request created at ${result.pullRequestUrl}`,
        0
      );

      // For new content creation, redirect to the collection page with folder
      if (crudType === 'create') {
        const folderPath = relativePath.includes('/')
          ? relativePath.substring(0, relativePath.lastIndexOf('/'))
          : '';
        window.location.hash = `#/collections/${collection.name}${
          folderPath ? `/${folderPath}` : ''
        }`;
      }

      close();
    } catch (e: unknown) {
      console.error(e);
      let errorMessage =
        'Recovery failed, please try again. If the problem persists please contact support.';

      const err = e as EditorialWorkflowErrorDetails;

      if (err.errorCode) {
        switch (err.errorCode) {
          case EDITORIAL_WORKFLOW_ERROR.BRANCH_EXISTS:
            errorMessage = 'A branch with this name already exists. Please choose a different name.';
            break;
          case EDITORIAL_WORKFLOW_ERROR.BRANCH_HIERARCHY_CONFLICT:
            errorMessage =
              err.message || 'Branch name conflicts with an existing branch';
            break;
          case EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED:
            errorMessage = err.message || 'Invalid branch name';
            break;
        }
      } else if (err.message) {
        if (err.message.toLowerCase().includes('already exists')) {
          errorMessage = 'A branch with this name already exists. Please choose a different name.';
        } else if (err.message.toLowerCase().includes('conflict')) {
          errorMessage = err.message;
        }
      }

      setErrorMessage(errorMessage);
      setDisabled(false);
      setIsExecuting(false);
      setCurrentStep(0);
    }
  };

  const renderProgressIndicator = () => {
    return (
      <>
        <div className='flex justify-between my-8 relative px-5 sm:gap-x-8'>
          <div
            className='absolute top-5 h-0.5 bg-gray-200 -z-10'
            style={{ left: '50px', right: '50px' }}
          ></div>
          {currentStep > 1 && currentStep <= steps.length && (
            <div
              className='absolute top-5 h-0.5 bg-tina-orange -z-10 transition-all duration-500'
              style={{
                left: '50px',
                width: `calc((100% - 100px) * ${(currentStep - 1) / (steps.length - 1)})`,
              }}
            ></div>
          )}
          {currentStep > 2 && (
            <div
              className='absolute top-5 h-0.5 bg-green-500 -z-10 transition-all duration-500'
              style={{
                left: '50px',
                width: `calc((100% - 100px) * ${Math.min(1, (currentStep - 2) / (steps.length - 1))})`,
              }}
            ></div>
          )}

          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div
                key={step.id}
                className='flex flex-col items-center relative'
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium mb-3 border-2 transition-all duration-300 select-none ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'bg-tina-orange border-tina-orange text-white'
                        : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : isActive ? (
                    <AiOutlineLoading className='animate-spin text-lg' />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className='text-center max-w-24'>
                  <div className='text-sm font-semibold leading-tight'>
                    {step.name}
                  </div>
                  <div className='text-xs text-gray-400 mt-1 leading-tight'>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className='flex items-center justify-between'>
          <div className='text-xs text-gray-500'>Estimated time: 1-2 min</div>
          {isExecuting && currentStep > 0 && (
            <div className='flex items-center gap-1 text-sm text-gray-500'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                  clipRule='evenodd'
                />
              </svg>
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderStateContent = () => {
    if (isExecuting) {
      return renderProgressIndicator();
    } else {
      return (
        <div className='max-w-md'>
          {errorMessage && (
            <div className='flex items-center gap-1 text-red-700 py-2 px-3 mb-4 bg-red-50 border border-red-200 rounded'>
              <BiError className='w-5 h-auto text-red-400 flex-shrink-0' />
              <span className='text-sm'>
                <b>Error:</b> {errorMessage}
              </span>
            </div>
          )}
          <div className='flex items-start gap-3 p-4 mb-4 bg-amber-50 border border-amber-200 rounded'>
            <BiGitMerge className='w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5' />
            <div>
              <p className='text-sm font-semibold text-amber-800 mb-1'>
                Branch no longer available
              </p>
              <p className='text-sm text-amber-700'>
                The branch <span className='font-mono bg-amber-100 px-1 rounded'>{missingBranchName}</span> has
                been merged or deleted. Your unsaved changes can still be recovered.
              </p>
            </div>
          </div>
          <p className='text-lg text-gray-700 font-bold mb-2'>
            Recover your changes
          </p>
          <p className='text-sm text-gray-700 mb-4'>
            To save your changes, create a new branch. This will preserve your
            work and create a new pull request for review.
          </p>
          <PrefixedTextField
            name='new-branch-name'
            label='New Branch Name'
            placeholder='e.g. my-updates-recovery'
            value={newBranchName}
            onChange={(e) => {
              setErrorMessage('');
              setNewBranchName(e.target.value);
            }}
          />
        </div>
      );
    }
  };

  return (
    <Modal className='flex'>
      <PopupModal className='w-auto'>
        <ModalHeader close={isExecuting ? undefined : close}>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center'>Recover unsaved changes</div>
          </div>
        </ModalHeader>
        <ModalBody padded={true}>{renderStateContent()}</ModalBody>
        {!isExecuting && (
          <ModalActions align='end'>
            <Button
              variant='secondary'
              className='w-full sm:w-auto flex items-center gap-1'
              onClick={handleDiscard}
            >
              <BiTrash className='w-4 h-4' />
              Discard changes
            </Button>
            <Button
              variant='primary'
              className='w-full sm:w-auto flex items-center gap-1'
              disabled={newBranchName === '' || disabled}
              onClick={executeRecovery}
            >
              <GitBranchIcon
                className='w-4 h-4'
                style={{ fill: 'none' }}
              />
              Recover to new branch
            </Button>
          </ModalActions>
        )}
      </PopupModal>
    </Modal>
  );
};
