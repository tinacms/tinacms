import * as React from 'react';
import { BiError } from 'react-icons/bi';
import {
  Eye,
  FileText,
  GitBranchIcon,
  Globe,
  TriangleAlert,
} from 'lucide-react';
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
import { Form } from '@toolkit/forms';
import { EditorialWorkflowProgressModal } from './editorial-workflow-progress-modal';
import { checkBaseBranchExists } from './editorial-workflow-utils';
import { useEditorialWorkflow } from './use-editorial-workflow';
import { useLocalStorage } from '@toolkit/hooks/use-local-storage';
import {
  SAVE_CHOICE_KEY,
  type SaveChoice,
  resolveSaveOptions,
} from './save-options';
import { EditorialWorkflowSaveEvent } from '../../lib/posthog/posthog';
import { captureEvent } from '../../lib/posthog/posthogProvider';

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
  tinaForm,
  onBaseBranchDeleted,
}: {
  safeSubmit: (editorialWorkflowChoice?: SaveChoice) => Promise<void>;
  close: () => void;
  path: string;
  values: Record<string, unknown>;
  crudType: string;
  tinaForm?: Form;
  onBaseBranchDeleted?: () => void;
}) => {
  const cms = useCMS();
  const tinaApi = cms.api.tina;
  const [newBranchName, setNewBranchName] = React.useState(
    formatDefaultBranchName(path, crudType)
  );
  const [isBranchGuardChecking, setIsBranchGuardChecking] =
    React.useState(false);
  const branchGuardAbortRef = React.useRef<AbortController | null>(null);

  const {
    isExecuting,
    errorMessage,
    currentStep,
    elapsedTime,
    executeWorkflow,
    reset,
  } = useEditorialWorkflow();

  const abortBranchGuard = React.useCallback(() => {
    branchGuardAbortRef.current?.abort();
    branchGuardAbortRef.current = null;
    setIsBranchGuardChecking(false);
  }, []);

  React.useEffect(() => {
    return () => {
      branchGuardAbortRef.current?.abort();
    };
  }, []);

  const executeEditorialWorkflow = async (isDraft: boolean) => {
    abortBranchGuard();
    const abortController = new AbortController();
    branchGuardAbortRef.current = abortController;
    setIsBranchGuardChecking(true);

    const baseBranch = decodeURIComponent(tinaApi.branch);
    const targetBranch = `tina/${newBranchName}`;

    const baseBranchExists = await checkBaseBranchExists(
      tinaApi,
      baseBranch,
      'executeEditorialWorkflow',
      abortController.signal
    );

    if (abortController.signal.aborted) return;

    if (!baseBranchExists) {
      abortBranchGuard();
      console.debug(
        '[tina:branch-guard] executeEditorialWorkflow: base branch deleted — handing off'
      );
      onBaseBranchDeleted?.();
      return;
    }

    setIsBranchGuardChecking(false);

    const { success, error } = await executeWorkflow({
      branchName: targetBranch,
      baseBranch,
      path,
      values,
      crudType,
      tinaForm,
      signal: abortController.signal,
      isDraft,
    });
    if (branchGuardAbortRef.current === abortController) {
      branchGuardAbortRef.current = null;
    }

    captureEvent(EditorialWorkflowSaveEvent, {
      choice: isDraft ? 'draft' : 'review',
      success,
      error,
    });

    if (success) {
      close();
    }
  };

  if (isExecuting) {
    return (
      <EditorialWorkflowProgressModal
        title='Save changes to new branch'
        currentStep={currentStep}
        elapsedTime={elapsedTime}
      />
    );
  }

  return (
    <CreateBranchPromptModal
      branchName={newBranchName}
      close={() => {
        abortBranchGuard();
        close();
      }}
      errorMessage={errorMessage}
      disabled={newBranchName === '' || isBranchGuardChecking}
      onBranchNameChange={(value) => {
        abortBranchGuard();
        reset();
        setNewBranchName(value);
      }}
      onCreateBranch={executeEditorialWorkflow}
      onSaveToProtectedBranch={() => {
        abortBranchGuard();
        close();
        safeSubmit('publish');
      }}
      showSaveOptions={true}
      disablePublish={!!tinaApi.usingProtectedBranch()}
    />
  );
};

export const CreateBranchPromptModal = ({
  branchName,
  close,
  disabled,
  errorMessage,
  onBranchNameChange,
  onCreateBranch,
  onSaveToProtectedBranch,
  showSaveOptions = false,
  disablePublish = false,
}: {
  branchName: string;
  close: () => void;
  disabled?: boolean;
  errorMessage?: string;
  onBranchNameChange: (value: string) => void;
  onCreateBranch: (isDraft: boolean) => void;
  onSaveToProtectedBranch: () => void;
  // Content editorial workflow opts in to the draft / ready / publish save
  // options. The media workflow reuses this modal but keeps its legacy button.
  showSaveOptions?: boolean;
  // Disable "Save and publish" (direct commit) on protected branches, w/ tooltip.
  disablePublish?: boolean;
}) => {
  // Remember the editor's last save choice; the main button reflects it
  // (default "Save draft"), the caret menu offers the others.
  const [lastChoice, setLastChoice] = useLocalStorage(
    SAVE_CHOICE_KEY,
    'draft'
  ) as [SaveChoice, (choice: SaveChoice) => void];
  const { main, menu } = resolveSaveOptions(lastChoice, disablePublish);

  const choices: Record<
    SaveChoice,
    {
      label: string;
      Icon: React.ComponentType<any>;
      run: () => void;
      disabled?: boolean;
      tooltip?: string;
    }
  > = {
    draft: {
      label: 'Save draft',
      Icon: FileText,
      run: () => onCreateBranch(true),
    },
    review: {
      label: 'Save (ready for review)',
      Icon: Eye,
      run: () => onCreateBranch(false),
    },
    publish: {
      label: 'Save and publish',
      Icon: Globe,
      run: onSaveToProtectedBranch,
      disabled: disablePublish,
      tooltip: disablePublish
        ? 'This branch is protected. Save a draft or send it for review instead.'
        : undefined,
    },
  };
  const mainChoice = choices[main] ?? choices.draft;
  const MainIcon = mainChoice.Icon;

  return (
    <Modal className='flex'>
      <PopupModal className='w-auto'>
        <ModalHeader close={close}>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center'>Save changes to new branch</div>
          </div>
        </ModalHeader>
        <ModalBody padded={true}>
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
              To make changes, you need to create a copy then get it approved
              and merged for it to go live.
              <br />
              <br />
              <span className='text-gray-500'>Learn more about </span>
              <a
                className='underline text-tina-orange-dark font-medium'
                href='https://tina.io/docs/r/editorial-workflow'
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
              value={branchName}
              onChange={(e) => {
                onBranchNameChange(e.target.value);
              }}
            />
          </div>
        </ModalBody>
        <ModalActions align='end'>
          <Button
            variant='secondary'
            className='w-full sm:w-auto'
            onClick={close}
          >
            Cancel
          </Button>
          {showSaveOptions ? (
            <DropdownButton
              variant='primary'
              align='start'
              className='w-full sm:w-auto'
              disabled={disabled}
              onMainAction={mainChoice.run}
              items={menu.map((choice) => {
                const option = choices[choice];
                const OptionIcon = option.Icon;
                return {
                  label: option.label,
                  icon: <OptionIcon className='w-4 h-4' />,
                  disabled: option.disabled,
                  tooltip: option.tooltip,
                  onClick: () => {
                    setLastChoice(choice);
                    option.run();
                  },
                };
              })}
            >
              <MainIcon className='w-4 h-4 mr-1' style={{ fill: 'none' }} />
              {mainChoice.label}
            </DropdownButton>
          ) : (
            <DropdownButton
              variant='primary'
              align='start'
              className='w-full sm:w-auto'
              disabled={disabled}
              onMainAction={() => onCreateBranch(false)}
              items={[
                {
                  label: 'Save to Protected Branch',
                  onClick: onSaveToProtectedBranch,
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
          )}
        </ModalActions>
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
