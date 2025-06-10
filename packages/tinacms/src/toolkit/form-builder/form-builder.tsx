import type { Form } from '@toolkit/forms';
import * as React from 'react';
import { type FC, useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';

// Replace the problematic import with a type alias
// import type { TinaSchema } from '@tinacms/schema-tools';
type TinaSchema = any; // TODO: Replace with proper type when available

import { formatBranchName, useBranchData } from '@toolkit/plugin-branch-switcher';
import { Button, OverflowMenu } from '@toolkit/styles';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import { BiError, BiGitBranch, BiLoaderAlt } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { MdOutlineSaveAlt } from 'react-icons/md';
import { TinaAdminApi } from '../../admin/api';
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
        rel="noopener noreferrer"
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

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef(null);
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

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
  const schema: TinaSchema = cms.api.tina.schema;

  React.useEffect(() => {
    const collection = schema.getCollectionByFullPath(tinaForm.relativePath);
    if (collection?.ui?.beforeSubmit) {
      tinaForm.beforeSubmit = (values: any) =>
        collection.ui.beforeSubmit({ cms, form: tinaForm, values });
    } else {
      tinaForm.beforeSubmit = undefined;
    }
  }, [tinaForm.relativePath]);

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
                path={tinaForm.relativePath}
                values={tinaForm.values}
                close={() => setCreateBranchModalOpen(false)}
              />
            )}
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormKeyBindings onSubmit={safeHandleSubmit} />
              <FormPortalProvider>
                <FormWrapper
                  header={<PanelHeader {...fieldGroup} id={tinaForm.id} />}
                  id={tinaForm.id}
                >
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
                <div className='relative flex-none w-full h-16 px-12 bg-white border-t border-gray-100 flex items-center justify-end'>
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

export const FormStatus = ({ pristine }) => {
  return (
    <div className='flex flex-0 items-center'>
      {!pristine && (
        <>
          <p className='text-gray-500 text-xs leading-tight whitespace-nowrap mr-2'>
            Unsaved Changes
          </p>
          <span className='w-3 h-3 flex-0 rounded-full bg-red-300 border border-red-400' />{' '}
        </>
      )}
      {pristine && (
        <>
          <span className='w-3 h-3 flex-0 rounded-full bg-green-300 border border-green-400' />{' '}
        </>
      )}
    </div>
  );
};

export const FormWrapper = ({
  header,
  children,
  id,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  id: string;
}) => {
  return (
    <div
      data-test={`form:${id?.replace(/\\/g, '/')}`}
      className='h-full overflow-y-auto max-h-full bg-gray-50'
    >
      {header}
      <div className='py-5 px-6 xl:px-12'>
        <div className='w-full flex justify-center'>
          <div className='w-full'>{children}</div>
        </div>
      </div>
    </div>
  );
};

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[40px] leading-none inline-block ${className}`}
    {...props}
  />
);

const isNumber = (item: string) => {
  return !isNaN(Number(item));
};

const PanelHeader = (props: { label?: string; name?: string; id: string }) => {
  const cms = useCMS();
  const activePath = props.name?.split('.') || [];
  if (!activePath || activePath.length === 0) {
    return null;
  }

  let lastItemIndex;
  activePath.forEach((item, index) => {
    if (!isNumber(item)) {
      lastItemIndex = index;
    }
  });
  const returnPath = activePath.slice(0, lastItemIndex);

  return (
    <button
      type='button'
      className={`relative z-40 group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm
   border-gray-100 px-6 -mt-px`}
      onClick={() => {
        cms.dispatch({
          type: 'forms:set-active-field-name',
          value: {
            formId: props.id,
            fieldName: returnPath.length > 0 ? returnPath.join('.') : null,
          },
        });
      }}
      tabIndex={-1}
    >
      <div className='flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto'>
        {props.label || props.name || 'Back'}
        <IoMdClose className='h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5' />
      </div>
    </button>
  );
};

const getAnimationProps = (animateStatus) => {
  const forwardsAnimation = {
    enter: 'transform transition ease-in-out duration-500 sm:duration-700',
    enterFrom: 'translate-x-8',
    enterTo: 'translate-x-0',
    leave: 'transform transition ease-in-out duration-500 sm:duration-700',
    leaveFrom: 'translate-x-0',
    leaveTo: 'translate-x-8',
  };
  const backwardsAnimation = {
    enter: 'transform transition ease-in-out duration-500 sm:duration-700',
    enterFrom: '-translate-x-8',
    enterTo: 'translate-x-0',
    leave: 'transform transition ease-in-out duration-500 sm:duration-700',
    leaveFrom: 'translate-x-0',
    leaveTo: '-translate-x-8',
  };

  return animateStatus === 'backwards'
    ? backwardsAnimation
    : animateStatus === 'forwards'
      ? forwardsAnimation
      : {};
};

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

type IndexingState =
  | 'starting'
  | 'indexing'
  | 'submitting'
  | 'creatingPR'
  | 'creatingBranch'
  | 'done'
  | 'error';

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
  const [error, setError] = React.useState('');
  const [branchName, setBranchName] = React.useState('');
  const [state, setState] = React.useState<IndexingState>('starting');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [baseBranch, setBaseBranch] = React.useState<string | undefined>(tinaApi.branch);

  useEffect(() => {
    const run = async () => {
      if (state === 'creatingBranch') {
        try {
          console.log('starting', branchName, formatBranchName(branchName));
          const currentBranch = tinaApi.branch;
          const name = await tinaApi.createBranch({
            branchName: formatBranchName(branchName),
            baseBranch: currentBranch,
          });
          if (!name) {
            throw new Error('Branch creation failed.');
          }
          setBranchName(name);
          setState('indexing');
          cms.alerts.success('Branch created.');
        } catch (e) {
          console.error(e);
          cms.alerts.error('Branch creation failed: ' + e.message);
          setErrorMessage(
            'Branch creation failed, please try again. By refreshing the page.'
          );
          setState('error');
        }
      } else if (state === 'indexing') {
        try {
          const [
            waitForIndexStatusPromise,
            _cancelWaitForIndexFunc,
          ] = tinaApi.waitForIndexStatus({
            ref: branchName,
          });
          await waitForIndexStatusPromise;
          cms.alerts.success('Branch indexed.');
          setState('submitting');
        } catch {
          cms.alerts.error('Branch indexing failed.');
          setErrorMessage(
            'Branch indexing failed, please check the TinaCloud dashboard for more information. To try again chick "re-index" on the branch in the dashboard.'
          );
          setState('error');
        }
      } else if (state === 'submitting') {
        try {
          setBaseBranch(tinaApi.branch);
          setCurrentBranch(branchName);
          const collection = tinaApi.schema.getCollectionByFullPath(path);

          const adminApi = new TinaAdminApi(cms);
          const params = adminApi.schema.transformPayload(collection.name, values);
          const relativePath = pathRelativeToCollection(
            collection.path,
            path
          );

          if (await adminApi.isAuthenticated()) {
            if (crudType === 'delete') {
              await adminApi.deleteDocument({
                collection: collection.name,
                relativePath: relativePath
              });
            } else if (crudType === 'create') {
              await adminApi.createDocument(collection, relativePath, params);
            } else {
              await adminApi.updateDocument(collection, relativePath, params);
            }
          } else {
            const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`;
            cms.alerts.error(authMessage);
            console.error(authMessage);
            setErrorMessage(authMessage);
            setState('error');
            return;
          }
          cms.alerts.success('Content saved.');
          setState('creatingPR');
        } catch (e) {
          console.error(e);
          cms.alerts.error('Content save failed.');
          setErrorMessage(
            'Content save failed, please try again. If the problem persists please contact support.'
          );
          setState('error');
        }
      }
      else if (state === 'creatingPR') {
        try {
          const result = await tinaApi.createPullRequest({
            baseBranch,
            branch: branchName,
            title: `${branchName
              .replace('tina/', '')
              .replace('-', ' ')} (PR from TinaCMS)`,
          });
          console.log('PR created', result);
          cms.alerts.success('Pull request created.');
          setState('done');
          close();

        } catch (e) {
          console.error(e);
          cms.alerts.error('Failed to create PR');
          setErrorMessage(
            'Failed to create PR, please try again. If the problem persists please contact support.'
          );
          setState('error');
        }
      }
    };

    if (state !== 'starting' && state !== 'done' && state !== 'error') {
      run();
    }
  }, [state, branchName, path, values, crudType, baseBranch]);

  const onCreateBranch = async (inputBranchName: string) => {
    setBranchName(`tina/${inputBranchName}`);
    setState('creatingBranch');
  };

  const renderStateContent = () => {
    if (state === 'starting') {
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
              setError('');
              setNewBranchName(formatBranchName(e.target.value));
            }}
          />
          {error && <div className='mt-2 text-sm text-red-700'>{error}</div>}
        </>
      );
    } else if (state === 'error') {
      return (
        <div className='flex items-center gap-1 text-red-700 py-4'>
          <BiError className='w-7 h-auto text-red-400 flex-shrink-0' />
          <span><b>Error:</b> {errorMessage}</span>
        </div>
      );
    } else {
      return (
        <div className='flex flex-col items-center gap-4 py-6'>
          <BiLoaderAlt className='opacity-70 text-blue-400 animate-spin w-10 h-auto' />
          {state === 'creatingBranch' && <p>Creating branch&hellip;</p>}
          {state === 'indexing' && <p>Indexing Content&hellip;</p>}
          {state === 'submitting' && <p>Saving content&hellip;</p>}
          {state === 'creatingPR' && <p>Creating Pull Request&hellip;</p>}
        </div>
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
        <ModalBody padded={true}>
          {renderStateContent()}
        </ModalBody>
        {state === 'starting' && (
          <ModalActions>
            <Button style={{ flexGrow: 1 }} onClick={close}>
              Cancel
            </Button>
            <Button
              variant='primary'
              style={{ flexGrow: 2 }}
              disabled={newBranchName === '' || Boolean(error) || disabled}
              onClick={async () => {
                setDisabled(true);
                const branchList = await tinaApi.listBranches({
                  includeIndexStatus: false,
                });
                const contentBranches = branchList
                  .filter((x) => x?.name?.startsWith('tina/'))
                  .map((x) => x.name.replace('tina/', ''));

                if (contentBranches.includes(newBranchName)) {
                  setError('Branch already exists');
                  setDisabled(false);
                  return;
                }

                if (!error) onCreateBranch(newBranchName);
              }}
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
    <div className='border border-gray-200 focus-within:border-blue-200 bg-gray-100 focus-within:bg-blue-100 rounded-md shadow-sm focus-within:shadow-outline overflow-hidden flex items-stretch divide-x divide-gray-200 focus-within:divide-blue-100 w-full transition-all ease-out duration-150'>
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
