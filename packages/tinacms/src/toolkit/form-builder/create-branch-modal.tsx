import { FieldLabel } from '@toolkit/fields';
import { Form } from '@toolkit/forms';
import { useLocalStorage } from '@toolkit/hooks/use-local-storage';
import { Button, DropdownButton } from '@toolkit/styles';
import {
  formatDefaultBranchName,
  normalizeBranchName,
} from '@utils/branch-name';
import {
  CircleAlert,
  Eye,
  FileText,
  GitBranchIcon,
  Globe,
  TriangleAlert,
} from 'lucide-react';
import * as React from 'react';
import { EditorialWorkflowSaveEvent } from '../../lib/posthog/posthog';
import { captureEvent } from '../../lib/posthog/posthogProvider';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import { EditorialWorkflowProgressModal } from './editorial-workflow-progress-modal';
import { checkBranchGuard } from './editorial-workflow-utils';
import {
  SAVE_CHOICE_KEY,
  type SaveChoice,
  resolveSaveOptions,
} from './save-options';
import { useEditorialWorkflow } from './use-editorial-workflow';

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
  const normalizedBranchName = normalizeBranchName(newBranchName);
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
    const targetBranch = `tina/${normalizedBranchName}`;

    const { baseBranchExists, targetBranchExists } = await checkBranchGuard(
      tinaApi,
      baseBranch,
      targetBranch,
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
      targetBranchExists,
      isDraft,
    });
    if (branchGuardAbortRef.current === abortController) {
      branchGuardAbortRef.current = null;
    }

    // Cancelled mid-run (modal closed, branch renamed, another save started, or
    // unmounted) — treat as a no-op and record nothing.
    if (abortController.signal.aborted) return;

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
      disabled={normalizedBranchName === '' || isBranchGuardChecking}
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

const getInitials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const CommittingAs = () => {
  const cms = useCMS();
  const user = cms.api?.tina?.user;
  const mode = user?.gitAuthoring?.mode;

  if (mode !== 'bot' && mode !== 'user') {
    return null;
  }

  const authorName =
    mode === 'bot' ? 'TinaCloud bot' : user.fullName || user.email;

  if (!authorName) {
    return null;
  }

  return (
    <div className='flex items-center gap-3 mt-4 pt-4 border-t border-gray-100'>
      <span className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0'>
        {getInitials(authorName)}
      </span>
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-gray-700 font-medium truncate'>
          {authorName}
        </p>
        <p className='text-xs text-gray-500'>Committing as</p>
      </div>
      <a
        className='text-sm underline text-tina-orange-dark font-medium flex-shrink-0'
        href={cms.api.tina.gitSettingsLink}
        target='_blank'
        rel='noreferrer'
      >
        Change
      </a>
    </div>
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
  allowSaveToProtectedBranch = true,
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
  // Drop "Save to Protected Branch" when the direct write it performs cannot succeed.
  allowSaveToProtectedBranch?: boolean;
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
                <CircleAlert className='w-5 h-auto text-red-400 flex-shrink-0' />
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
            <CommittingAs />
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
          ) : allowSaveToProtectedBranch ? (
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
          ) : (
            // A plain button: the dropdown's only item is the one being dropped.
            <Button
              variant='primary'
              className='w-full sm:w-auto'
              disabled={disabled}
              onClick={() => onCreateBranch(false)}
            >
              <GitBranchIcon
                className='w-4 h-4 mr-1'
                style={{ fill: 'none' }}
              />
              Save to a new branch
            </Button>
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
