import * as React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';
import { BiError } from 'react-icons/bi';
import { GitBranchIcon, TriangleAlert } from 'lucide-react';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { Button, DropdownButton } from '@toolkit/styles';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import { FieldLabel } from '@toolkit/fields';
import { EDITORIAL_WORKFLOW_STATUS } from './editorial-workflow-constants';
import {
  CREATE_DOCUMENT_GQL,
  DELETE_DOCUMENT_GQL,
  UPDATE_DOCUMENT_GQL,
} from '../../admin/api';

const pathRelativeToCollection = (
  collectionPath: string,
  fullPath: string
): string => {
  // Normalize paths with forward slashes
  const normalizedCollectionPath = collectionPath.replace(/\\/g, '/');
  const normalizedFullPath = fullPath.replace(/\\/g, '/');

  // Ensure collection path ends with a slash
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

// Format the default branch name by removing content/ prefix and file extension
const formatDefaultBranchName = (
  filePath: string,
  crudType: string
): string => {
  let result = filePath;

  const contentPrefix = 'content/';
  // Remove "content/" prefix if present
  if (result.startsWith(contentPrefix)) {
    result = result.substring(contentPrefix.length);
  }

  // Remove file extension
  const lastDot = result.lastIndexOf('.');
  const lastSlash = Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\'));
  if (lastDot > lastSlash && lastDot > 0) {
    result = result.slice(0, lastDot);
  }

  // Add deletion indicator for delete operations
  if (crudType === 'delete') {
    result = `❌-${result}`;
  }

  return result;
};

export const CreateBranchModal = ({
  close,
  safeSubmit,
  path,
  values,
  crudType,
}: {
  safeSubmit: () => Promise<void>;
  close: () => void;
  path: string;
  values: Record<string, unknown>;
  crudType: string;
}) => {
  const cms = useCMS();
  const tinaApi = cms.api.tina;
  const { setCurrentBranch } = useBranchData();
  const [disabled, setDisabled] = React.useState(false);
  const [newBranchName, setNewBranchName] = React.useState(
    formatDefaultBranchName(path, crudType)
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
      name: 'Updating branch',
      description: 'Syncing content to branch',
    },
    {
      id: 3,
      name: 'Creating pull request',
      description: 'Preparing for review',
    },
  ];

  const executeEditorialWorkflow = async () => {
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

      const result = await tinaApi.executeEditorialWorkflow({
        branchName: branchName,
        baseBranch: tinaApi.branch,
        prTitle: `${branchName.replace('tina/', '').replace('-', ' ')} (PR from TinaCMS)`,
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
      cms.alerts.success(
        `Branch created successfully - Pull Request at ${result.pullRequestUrl}`,
        0
      );

      // For new content creation, redirect to the collection page with folder
      if (crudType === 'create') {
        // Extract folder path from relativePath (e.g., "folder/file.md" -> "folder")
        const folderPath = relativePath.includes('/')
          ? relativePath.substring(0, relativePath.lastIndexOf('/'))
          : '';
        window.location.hash = `#/collections/${collection.name}${
          folderPath ? `/${folderPath}` : ''
        }`;
      }

      close();
    } catch (e) {
      console.error(e);
      const errorMessage =
        e.message && e.message.includes('Branch already exists')
          ? 'Branch already exists'
          : 'Branch operation failed, please try again. If the problem persists please contact support.';
      setErrorMessage(errorMessage);
      setDisabled(false);
      setIsExecuting(false);
      setCurrentStep(0);
    }
  };

  const renderProgressIndicator = () => {
    return (
      <>
        {/* Horizontal step indicators */}
        <div className='flex justify-between my-8 relative px-5 sm:gap-x-8'>
          {/* Connecting line - only between steps */}
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
          {/* Green progress bar for completed sections */}
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

        {/* Timer and estimated time - inline */}
        <div className='flex items-center justify-between'>
          <div className='text-xs text-gray-500'>Estimated time: 1-2 min </div>
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
        <a
          className='underline text-tina-orange-dark font-medium text-xs'
          href='https://tina.io/docs/tinacloud/editorial-workflow'
          target='_blank'
        >
          Learn more about Editorial Workflow
        </a>
      </>
    );
  };

  const renderStateContent = () => {
    if (isExecuting) {
      return renderProgressIndicator();
    } else {
      return (
        <div className='max-w-sm'>
          {errorMessage && (
            <div className='flex items-center gap-1 text-red-700 py-2 px-3 mb-4 bg-red-50 border border-red-200 rounded'>
              <BiError className='w-5 h-auto text-red-400 flex-shrink-0' />
              <span className='text-sm'>
                <b>Error:</b> {errorMessage}
              </span>
            </div>
          )}
          <p className='text-lg text-gray-700 font-bold mb-2'>
            First, let's create a copy
          </p>
          <p className='text-sm text-gray-700 mb-4 max-w-sm'>
            To make changes, you need to create a copy then get it approved and
            merged for it to go live.
            <br />
            <br />
            <span className='text-gray-500'>Learn more about </span>
            <a
              className='underline text-tina-orange-dark font-medium'
              href='https://tina.io/docs/tinacloud/editorial-workflow'
              target='_blank'
            >
              Editorial Workflow
            </a>
            .
          </p>
          <PrefixedTextField
            name='new-branch-name'
            label={'Branch Name'}
            placeholder='e.g. {{PAGE-NAME}}-updates'
            value={newBranchName}
            onChange={(e) => {
              // reset error state on change
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
            <div className='flex items-center'>Save changes to new branch</div>
          </div>
        </ModalHeader>
        <ModalBody padded={true}>{renderStateContent()}</ModalBody>
        {!isExecuting && (
          <ModalActions align='end'>
            <Button
              variant='secondary'
              className='w-full sm:w-auto'
              onClick={close}
            >
              Cancel
            </Button>
            <DropdownButton
              variant='primary'
              align='start'
              className='w-full sm:w-auto'
              disabled={newBranchName === '' || disabled}
              onMainAction={executeEditorialWorkflow}
              items={[
                {
                  label: 'Save to Protected Branch',
                  onClick: () => {
                    close();
                    safeSubmit();
                  },
                  icon: <TriangleAlert className='w-4 h-4' />,
                },
              ]}
            >
              <GitBranchIcon
                className='w-4 h-4 mr-1'
                style={{ fill: 'none' }}
              />
              Save to a new branch
            </DropdownButton>
          </ModalActions>
        )}
      </PopupModal>
    </Modal>
  );
};

export const PrefixedTextField = ({
  label = null,
  prefix = 'tina/',
  ...props
}) => {
  return (
    <>
      {label && <FieldLabel name={props.name}>{label}</FieldLabel>}
      <div className='border border-gray-200 focus-within:border-blue-200 bg-gray-100 focus-within:bg-blue-100 rounded shadow-sm focus-within:shadow-outline overflow-hidden flex items-stretch divide-x divide-gray-200 focus-within:divide-blue-100 w-full transition-all ease-out duration-150'>
        <span className='pl-3 pr-2 py-2 text-base text-tina-orange-dark bg-tina-orange-light'>
          {prefix}
        </span>
        <input
          id={props.name}
          type='text'
          className='shadow-inner focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 flex-1 bg-white focus:text-gray-900'
          {...props}
        />
      </div>
    </>
  );
};
