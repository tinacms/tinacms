import * as React from 'react';
import { BiError } from 'react-icons/bi';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { useCMS } from '@toolkit/react-core';
import {
  Modal,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@toolkit/react-modals';
import { CreateBranchPromptModal } from '@toolkit/form-builder/create-branch-modal';
import {
  checkBranchGuard,
  type MediaWorkflowConfirmBranchEvent,
  TARGET_BRANCH_EXISTS_ERROR,
} from '@toolkit/form-builder/editorial-workflow-utils';
import { EditorialWorkflowProgressModal } from '@toolkit/form-builder/editorial-workflow-progress-modal';
import { getEditorialWorkflowErrorMessage } from '@toolkit/form-builder/use-editorial-workflow';

type WorkflowState =
  | { phase: 'idle' }
  | {
      phase: 'confirming';
      branchName: string;
      baseBranch: string;
      errorMessage?: string;
      isChecking?: boolean;
      onConfirm: (branchName: string) => Promise<void>;
      onCancel: () => void;
      onSaveToProtectedBranch: () => void;
    }
  | { phase: 'executing'; step: number; elapsed: number }
  | { phase: 'error'; message: string };

export const MediaWorkflowOverlay = () => {
  const cms = useCMS();
  const { setCurrentBranch } = useBranchData();

  const [state, setState] = React.useState<WorkflowState>({ phase: 'idle' });
  const preflightAbortRef = React.useRef<AbortController | null>(null);

  const abortPreflight = React.useCallback(() => {
    preflightAbortRef.current?.abort();
    preflightAbortRef.current = null;
  }, []);

  React.useEffect(() => {
    const offConfirm = cms.events.subscribe<MediaWorkflowConfirmBranchEvent>(
      'media:workflow:confirm-branch',
      (event) => {
        abortPreflight();
        setState({
          phase: 'confirming',
          branchName: event.branchName,
          baseBranch: event.baseBranch,
          onConfirm: event.onConfirm,
          onCancel: event.onCancel,
          onSaveToProtectedBranch: event.onSaveToProtectedBranch,
        });
      }
    );
    const offStart = cms.events.subscribe('media:workflow:start', () => {
      setState({ phase: 'executing', step: 1, elapsed: 0 });
    });
    const offStep = cms.events.subscribe<{ type: string; step: number }>(
      'media:workflow:step',
      (event) => {
        setState((prev) =>
          prev.phase === 'executing'
            ? { ...prev, step: event.step }
            : { phase: 'executing', step: event.step, elapsed: 0 }
        );
      }
    );
    const offComplete = cms.events.subscribe<{
      type: string;
      branchName: string;
    }>('media:workflow:complete', (event) => {
      setCurrentBranch(event.branchName);
    });
    const offError = cms.events.subscribe<{ type: string; message: string }>(
      'media:workflow:error',
      (event) => {
        setState({ phase: 'error', message: event.message });
      }
    );
    const offFinish = cms.events.subscribe('media:workflow:finish', () => {
      setState({ phase: 'idle' });
    });

    return () => {
      offConfirm();
      offStart();
      offStep();
      offComplete();
      offError();
      offFinish();
      abortPreflight();
    };
  }, [abortPreflight, cms, setCurrentBranch]);

  React.useEffect(() => {
    if (state.phase !== 'executing') return;
    const interval = setInterval(() => {
      setState((prev) =>
        prev.phase === 'executing'
          ? { ...prev, elapsed: prev.elapsed + 1 }
          : prev
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase]);

  const handleCreateBranch = async () => {
    if (state.phase !== 'confirming') return;

    const confirmState = state;
    const branchName = confirmState.branchName;
    const targetBranch = `tina/${branchName}`;
    abortPreflight();
    const abortController = new AbortController();
    preflightAbortRef.current = abortController;
    setState({
      ...confirmState,
      isChecking: true,
      errorMessage: '',
    });

    const { baseBranchExists, targetBranchExists } = await checkBranchGuard(
      cms.api.tina,
      confirmState.baseBranch,
      targetBranch,
      'media workflow',
      abortController.signal
    );

    if (abortController.signal.aborted) return;

    if (!baseBranchExists) {
      if (preflightAbortRef.current === abortController) {
        preflightAbortRef.current = null;
      }
      setState({
        ...confirmState,
        branchName,
        isChecking: false,
        errorMessage: `The branch ${confirmState.baseBranch} no longer exists. It may have been merged or deleted. Your changes cannot be pushed to it.`,
      });
      return;
    }

    if (targetBranchExists) {
      if (preflightAbortRef.current === abortController) {
        preflightAbortRef.current = null;
      }
      setState({
        ...confirmState,
        branchName,
        isChecking: false,
        errorMessage: TARGET_BRANCH_EXISTS_ERROR,
      });
      return;
    }

    try {
      if (preflightAbortRef.current === abortController) {
        preflightAbortRef.current = null;
      }
      setState({ phase: 'executing', step: 1, elapsed: 0 });
      await confirmState.onConfirm(targetBranch);
    } catch (e) {
      console.error(e);
      setState({
        ...confirmState,
        branchName,
        isChecking: false,
        errorMessage: getEditorialWorkflowErrorMessage(e),
      });
    }
  };

  if (state.phase === 'idle') return null;

  if (state.phase === 'confirming') {
    return (
      <CreateBranchPromptModal
        branchName={state.branchName}
        close={() => {
          abortPreflight();
          state.onCancel();
          setState({ phase: 'idle' });
        }}
        disabled={state.branchName === '' || state.isChecking}
        errorMessage={state.errorMessage}
        onBranchNameChange={(branchName) => {
          abortPreflight();
          setState((prev) =>
            prev.phase === 'confirming'
              ? {
                  ...prev,
                  branchName,
                  errorMessage: undefined,
                  isChecking: false,
                }
              : prev
          );
        }}
        onCreateBranch={handleCreateBranch}
        onSaveToProtectedBranch={() => {
          abortPreflight();
          state.onSaveToProtectedBranch();
          setState({ phase: 'idle' });
        }}
      />
    );
  }

  if (state.phase === 'executing') {
    return (
      <EditorialWorkflowProgressModal
        title='Save changes to new branch'
        currentStep={state.step}
        elapsedTime={state.elapsed}
      />
    );
  }

  const dismissError = () => setState({ phase: 'idle' });
  return (
    <Modal className='flex'>
      <PopupModal className='w-auto'>
        <ModalHeader close={dismissError}>Branch creation failed</ModalHeader>
        <ModalBody padded={true}>
          <div className='flex items-center gap-1 text-red-700 py-2 px-3 bg-red-50 border border-red-200 rounded max-w-sm'>
            <BiError className='w-5 h-auto text-red-400 flex-shrink-0' />
            <span className='text-sm'>
              <b>Error:</b> {state.message}
            </span>
          </div>
        </ModalBody>
      </PopupModal>
    </Modal>
  );
};
