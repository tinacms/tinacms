import type { Form } from '@toolkit/forms';
import * as React from 'react';
import { type FC, useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';

import {
  formatBranchName,
  useBranchData,
} from '@toolkit/plugin-branch-switcher';
import { Button, OverflowMenu } from '@toolkit/styles';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import { BiError, BiGitBranch, BiLoaderAlt } from 'react-icons/bi';
import { FaCircle } from 'react-icons/fa';
import { MdOutlineSaveAlt } from 'react-icons/md';
import {
  CREATE_DOCUMENT_GQL,
  DELETE_DOCUMENT_GQL,
  UPDATE_DOCUMENT_GQL,
} from '../../admin/api';
import { cn } from '../../utils/cn';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
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
  const [statusMessage, setStatusMessage] = React.useState('');

  const executeEditorialWorkflow = async () => {
    try {
      const branchName = `tina/${newBranchName}`;
      setStatusMessage('Initializing workflow...');
      setDisabled(true);
      setIsExecuting(true);

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
        branchName: formatBranchName(branchName), //TODO: Handle server-side 
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
          setStatusMessage(status.message || `Status: ${status.status}`);
        },
      });

      if (!result.branchName) {
        throw new Error('Branch creation failed.');
      }

      setCurrentBranch(result.branchName);

      cms.alerts.success('Branch created and content saved.');
      if (result.pullRequestURL) {
        cms.alerts.success('Pull request created.');
      }

      close();
    } catch (e) {
      console.error(e);
      cms.alerts.error('Branch operation failed: ' + e.message);
      const errorMessage =
        e.message && e.message.includes('Branch already exists')
          ? 'Branch already exists'
          : 'Branch operation failed, please try again. If the problem persists please contact support.';
      setErrorMessage(errorMessage);
      setDisabled(false);
      setIsExecuting(false);
    }
  };

  const renderStateContent = () => {
    if (errorMessage) {
      return (
        <div className='flex items-center gap-1 text-red-700 py-4'>
          <BiError className='w-7 h-auto text-red-400 flex-shrink-0' />
          <span>
            <b>Error:</b> {errorMessage}
          </span>
        </div>
      );
    } else if (isExecuting) {
      return (
        <div className='flex flex-col items-center gap-4 py-6'>
          <BiLoaderAlt className='opacity-70 text-blue-400 animate-spin w-10 h-auto' />
          <p>{statusMessage || 'Executing editorial workflow...'}</p>
        </div>
      );
    } else {
      return (
        <>
          <p className='text-lg text-gray-700 font-bold mb-2'>
            This content is protected 🚧
          </p>
          <p className='text-sm text-gray-700 mb-4'>
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
              setNewBranchName(formatBranchName(e.target.value));
            }}
          />
          {errorMessage && (
            <div className='mt-2 text-sm text-red-700'>{errorMessage}</div>
          )}
        </>
      );
    }
  };

  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>
          <BiGitBranch className='w-6 h-auto mr-1 text-blue-500 opacity-70' />{' '}
          Create Branch
        </ModalHeader>
        <ModalBody padded={true}>{renderStateContent()}</ModalBody>
        {!isExecuting && !errorMessage && (
          <ModalActions>
            <Button style={{ flexGrow: 1 }} onClick={close}>
              Cancel
            </Button>
            <Button
              variant='primary'
              style={{ flexGrow: 2 }}
              disabled={
                newBranchName === '' || Boolean(errorMessage) || disabled
              }
              onClick={executeEditorialWorkflow}
            >
              Create Branch and Save
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
