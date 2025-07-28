import type { Form } from '@toolkit/forms';
import * as React from 'react';
import { type FC, useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';

import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { Button, OverflowMenu } from '@toolkit/styles';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import { AiOutlineLoading } from 'react-icons/ai';
import { BiError, BiGitBranch } from 'react-icons/bi';
import { FaCircle } from 'react-icons/fa';
import { MdOutlineSaveAlt } from 'react-icons/md';
import {
  CREATE_DOCUMENT_GQL,
  DELETE_DOCUMENT_GQL,
  UPDATE_DOCUMENT_GQL,
} from '../../admin/api';
import { cn } from '../../utils/cn';
import { ProgressBar } from '../components/ProgressBar';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import { EDITORIAL_WORKFLOW_STATUS } from './editorial-workflow-constants';
import { FieldsBuilder } from './fields-builder';
import { FormActionMenu } from './form-actions';
import { FormPortalProvider } from './form-portal';
import { LoadingDots } from './loading-dots';
import { ResetForm } from './reset-form';

export interface FormBuilderProps {
  form: { tinaForm: Form; activeFieldName?: string };
  hideFooter?: boolean;
  label?: string;
  onPristineChange?: (_pristine: boolean) => unknown;
}

interface FormKeyBindingsProps {
  onSubmit: () => void;
}

const NoFieldsPlaceholder = () => (
  <div
    className='relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto'
    style={{
      animationName: 'fade-in',
      animationDelay: '300ms',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'both',
      animationDuration: '150ms',
    }}
  >
    <Emoji className='block pb-5'>🤔</Emoji>
    <h3 className='font-sans font-normal text-lg block pb-5'>
      Hey, you don't have any fields added to this form.
    </h3>
    <p className='block pb-5'>
      <a
        className='text-center rounded-3xl border border-solid border-gray-100 shadow-[0_2px_3px_rgba(0,0,0,0.12)] font-normal cursor-pointer text-[12px] transition-all duration-100 ease-out bg-white text-gray-700 py-3 pr-5 pl-14 relative no-underline inline-block hover:text-blue-500'
        href='https://tinacms.org/docs/fields'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Emoji
          className='absolute left-5 top-1/2 origin-center -translate-y-1/2 transition-all duration-100 ease-out'
          style={{ fontSize: 24 }}
        >
          📖
        </Emoji>{' '}
        Field Setup Guide
      </a>
    </p>
  </div>
);

const FormKeyBindings: FC<FormKeyBindingsProps> = ({ onSubmit }) => {
  // Submit when cmd/ctrl + s is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return null;
};

export const FormBuilder: FC<FormBuilderProps> = ({
  form,
  onPristineChange,
  ...rest
}) => {
  const cms = useCMS();
  const hideFooter = !!rest.hideFooter;
  const [createBranchModalOpen, setCreateBranchModalOpen] =
    React.useState(false);

  const tinaForm = form.tinaForm;
  const finalForm = form.tinaForm.finalForm;

  React.useEffect(() => {
    const collection = cms.api.tina.schema.getCollectionByFullPath(
      tinaForm.path
    );
    if (collection?.ui?.beforeSubmit) {
      tinaForm.beforeSubmit = (values: any) =>
        collection.ui.beforeSubmit({ cms, form: tinaForm, values });
    } else {
      tinaForm.beforeSubmit = undefined;
    }
  }, [tinaForm.path]);

  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !finalForm) return;
      const name = result.type;
      finalForm.mutators.move(
        name,
        result.source.index,
        result.destination.index
      );
    },
    [tinaForm]
  );

  /**
   * Prevent navigation away from the window when the form is dirty
   */
  React.useEffect(() => {
    // const onBeforeUnload = (event) => {
    //   event.preventDefault()
    //   event.returnValue = ''
    // }

    const unsubscribe = finalForm.subscribe(
      ({ pristine }) => {
        if (onPristineChange) {
          onPristineChange(pristine);
        }

        // if (!pristine) {
        //   window.addEventListener('beforeunload', onBeforeUnload)
        // } else {
        //   window.removeEventListener('beforeunload', onBeforeUnload)
        // }
      },
      { pristine: true }
    );
    return () => {
      // window.removeEventListener('beforeunload', onBeforeUnload)
      unsubscribe();
    };
  }, [finalForm]);

  const fieldGroup = tinaForm.getActiveField(form.activeFieldName);

  return (
    <FinalForm
      key={tinaForm.id}
      form={tinaForm.finalForm}
      onSubmit={tinaForm.onSubmit}
    >
      {({
        handleSubmit,
        pristine,
        invalid,
        submitting,
        dirtySinceLastSubmit,
        hasValidationErrors,
      }) => {
        const usingProtectedBranch = cms.api.tina.usingProtectedBranch();

        const canSubmit =
          !pristine &&
          !submitting &&
          !hasValidationErrors &&
          !(invalid && !dirtySinceLastSubmit);

        const safeSubmit = async () => {
          if (canSubmit) {
            await handleSubmit();
          }
        };

        const safeHandleSubmit = async () => {
          if (usingProtectedBranch) {
            setCreateBranchModalOpen(true);
          } else {
            safeSubmit();
          }
        };

        return (
          <>
            {createBranchModalOpen && (
              <CreateBranchModal
                safeSubmit={safeSubmit}
                crudType={tinaForm.crudType}
                path={tinaForm.path}
                values={tinaForm.values}
                close={() => setCreateBranchModalOpen(false)}
              />
            )}
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormKeyBindings onSubmit={safeHandleSubmit} />
              <FormPortalProvider>
                <FormWrapper id={tinaForm.id}>
                  {tinaForm?.fields.length ? (
                    <FieldsBuilder
                      form={tinaForm}
                      activeFieldName={form.activeFieldName}
                      fields={fieldGroup.fields}
                    />
                  ) : (
                    <NoFieldsPlaceholder />
                  )}
                </FormWrapper>
              </FormPortalProvider>
              {!hideFooter && (
                <div className='relative flex-none w-full h-16 px-6 bg-white border-t border-gray-100 flex items-center justify-end'>
                  <div className='flex-1 w-full justify-end gap-2	flex items-center max-w-form'>
                    {tinaForm.reset && (
                      <ResetForm
                        pristine={pristine}
                        reset={async () => {
                          finalForm.reset();
                          await tinaForm.reset!();
                        }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={safeHandleSubmit}
                      disabled={!canSubmit}
                      busy={submitting}
                      variant='primary'
                    >
                      {submitting && <LoadingDots />}
                      {!submitting && tinaForm.buttons.save}
                    </Button>
                    {tinaForm.actions.length > 0 && (
                      <FormActionMenu
                        form={tinaForm as any}
                        actions={tinaForm.actions}
                      />
                    )}
                  </div>
                </div>
              )}
            </DragDropContext>
          </>
        );
      }}
    </FinalForm>
  );
};

export const FormStatus = ({ pristine }: { pristine: boolean }) => {
  const pristineClass = pristine ? 'text-green-500' : 'text-red-500';
  return <FaCircle className={cn('h-3', pristineClass)} />;
};

export const FormWrapper = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      data-test={`form:${id?.replace(/\\/g, '/')}`}
      className='h-full overflow-y-auto max-h-full bg-gray-50'
    >
      <div className='py-5 px-6'>{children}</div>
    </div>
  );
};

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[40px] leading-none inline-block ${className}`}
    {...props}
  />
);

/**
 * @deprecated
 * Original misspelt version of CreateBranchModal
 */
export const CreateBranchModel = ({
  close,
  safeSubmit,
  relativePath,
  values,
  crudType,
}: {
  safeSubmit: () => Promise<void>;
  close: () => void;
  relativePath: string;
  values: Record<string, unknown>;
  crudType: string;
}) => (
  <CreateBranchModal
    close={close}
    safeSubmit={safeSubmit}
    path={relativePath}
    values={values}
    crudType={crudType}
  />
);

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
  const [newBranchName, setNewBranchName] = React.useState('');
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState('');
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
      setStatusMessage('Initializing workflow...');

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
          const message = status.message || `Status: ${status.status}`;
          setStatusMessage(message);

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
        `Branch created successfully - Pull Request at ${result.pullRequestUrl}`
      );

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
    const progressPercentage = ((currentStep - 1) / steps.length) * 100;

    return (
      <div className='py-6'>
        {/* Horizontal step indicators */}
        <div className='flex justify-between mb-4 relative px-5 sm:gap-x-8'>
          {/* Connecting line - only between steps */}
          <div
            className='absolute top-5 h-0.5 bg-gray-200 -z-10'
            style={{ left: '50px', right: '50px' }}
          ></div>
          {currentStep > 1 && currentStep <= steps.length && (
            <div
              className='absolute top-5 h-0.5 bg-blue-500 -z-10 transition-all duration-500'
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium mb-3 border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
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
                  <div
                    className={`text-sm font-semibold leading-tight ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                    }`}
                  >
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

        {/* Step count and timer - between stepper and progress bar */}
        <div className='flex items-center justify-between mb-4'>
          <div className='text-sm font-medium text-gray-700'>
            Step {currentStep > steps.length ? steps.length : currentStep} of{' '}
            {steps.length}
          </div>
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

        <ProgressBar
          progress={progressPercentage}
          className='mb-4'
          color={currentStep > steps.length ? 'green' : 'blue'}
        />

        {/* Current status - reduced padding */}
        <div className='flex items-center gap-2 mb-2'>
          {currentStep >= 4 ? (
            <svg
              className='w-4 h-4 text-green-500'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          ) : (
            <AiOutlineLoading className='text-blue-500 animate-spin' />
          )}
          <span className='text-sm font-medium text-gray-700'>
            {statusMessage || `${steps[currentStep - 1]?.name}...`}
          </span>
        </div>

        {/* Estimated time - aligned left */}
        <div className='text-left'>
          <p className='text-xs text-gray-500'>Estimated time: 1-2 minutes</p>
        </div>
      </div>
    );
  };

  const renderStateContent = () => {
    if (isExecuting) {
      return renderProgressIndicator();
    } else {
      return (
        <>
          {errorMessage && (
            <div className='flex items-center gap-1 text-red-700 py-2 px-3 mb-4 bg-red-50 border border-red-200 rounded'>
              <BiError className='w-5 h-auto text-red-400 flex-shrink-0' />
              <span className='text-sm'>
                <b>Error:</b> {errorMessage}
              </span>
            </div>
          )}
          <p className='text-lg text-gray-700 font-bold mb-2'>
            This content is protected 🚧
          </p>
          <p className='text-sm text-gray-700 mb-4 max-w-sm'>
            To make changes, you need to create a copy then get it approved and
            merged for it to go live.
          </p>
          <PrefixedTextField
            placeholder='e.g. {{PAGE-NAME}}-updates'
            value={newBranchName}
            onChange={(e) => {
              // reset error state on change
              setErrorMessage('');
              setStatusMessage('');
              setNewBranchName(e.target.value);
            }}
          />
        </>
      );
    }
  };

  return (
    <Modal className='flex'>
      <PopupModal className='w-auto'>
        <ModalHeader close={isExecuting ? undefined : close}>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center'>
              <BiGitBranch className='w-6 h-auto mr-1 text-blue-500 opacity-70' />
              Create Branch
            </div>
          </div>
        </ModalHeader>
        <ModalBody padded={true}>{renderStateContent()}</ModalBody>
        {!isExecuting && (
          <ModalActions>
            <Button style={{ flexGrow: 1 }} onClick={close}>
              Cancel
            </Button>
            <Button
              variant='primary'
              style={{ flexGrow: 2 }}
              disabled={newBranchName === '' || disabled}
              onClick={executeEditorialWorkflow}
            >
              Confirm
            </Button>
            <OverflowMenu
              className='-ml-2'
              toolbarItems={[
                {
                  name: 'override',
                  label: 'Save to Protected Branch',
                  Icon: <MdOutlineSaveAlt size='1rem' />,
                  onMouseDown: () => {
                    close();
                    safeSubmit();
                  },
                },
              ]}
            />
          </ModalActions>
        )}
      </PopupModal>
    </Modal>
  );
};

export const PrefixedTextField = ({ prefix = 'tina/', ...props }) => {
  return (
    <div className='border border-gray-200 focus-within:border-blue-200 bg-gray-100 focus-within:bg-blue-100 rounded shadow-sm focus-within:shadow-outline overflow-hidden flex items-stretch divide-x divide-gray-200 focus-within:divide-blue-100 w-full transition-all ease-out duration-150'>
      <span className='pl-3 pr-2 py-2 font-medium text-base text-gray-700 opacity-50'>
        {prefix}
      </span>
      <input
        type='text'
        className='shadow-inner focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 flex-1 bg-white focus:text-gray-900'
        {...props}
      />
    </div>
  );
};
