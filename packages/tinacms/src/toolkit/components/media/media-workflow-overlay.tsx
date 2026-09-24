import { CreateBranchPromptModal } from '@toolkit/form-builder/create-branch-modal';
import { EditorialWorkflowErrorBox } from '@toolkit/form-builder/editorial-workflow-error-box';
import { EditorialWorkflowProgressModal } from '@toolkit/form-builder/editorial-workflow-progress-modal';
import {
  type MediaWorkflowConfirmBranchEvent,
  TARGET_BRANCH_EXISTS_ERROR,
  checkBranchGuard,
} from '@toolkit/form-builder/editorial-workflow-utils';
import type { EditorialWorkflowErrorCopy } from '@toolkit/form-builder/editorial-workflow-utils';
import {
  collectionLabelResolver,
  getEditorialWorkflowError,
  plainMessage,
} from '@toolkit/form-builder/use-editorial-workflow';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { useCMS } from '@toolkit/react-core';
import {
  Modal,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@toolkit/react-modals';
import { normalizeBranchName } from '@utils/branch-name';
import { CircleAlert } from 'lucide-react';
import * as React from 'react';

type WorkflowState =
  | { phase: 'idle' }
  | {
      phase: 'confirming';
      branchName: string;
      baseBranch: string;
      error?: EditorialWorkflowErrorCopy;
      isChecking?: boolean;
      allowSaveToProtectedBranch: boolean;
      onConfirm: (branchName: string) => Promise<void>;
      onCancel: () => void;
      onSaveToProtectedBranch: () => void;
    }
  | { phase: 'executing'; step: number; elapsed: number }
  | { phase: 'error'; error: EditorialWorkflowErrorCopy };

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
          allowSaveToProtectedBranch: event.allowSaveToProtectedBranch,
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
    const offError = cms.events.subscribe<{
      type: string;
      message: string;
      error?: unknown;
    }>('media:workflow:error', (event) => {
      setState({
        phase: 'error',
        error:
          event.error === undefined
            ? { messageParts: plainMessage(event.message) }
            : getEditorialWorkflowError(
                event.error,
                collectionLabelResolver(cms.api.tina.schema)
              ),
      });
    });
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
    const targetBranch = `tina/${normalizeBranchName(branchName)}`;
    abortPreflight();
    const abortController = new AbortController();
    preflightAbortRef.current = abortController;
    setState({
      ...confirmState,
      isChecking: true,
      error: undefined,
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
        error: {
          messageParts: plainMessage(
            `The branch ${confirmState.baseBranch} no longer exists. It may have been merged or deleted. Your changes cannot be pushed to it.`
          ),
        },
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
        error: { messageParts: plainMessage(TARGET_BRANCH_EXISTS_ERROR) },
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
        error: getEditorialWorkflowError(
          e,
          collectionLabelResolver(cms.api.tina.schema)
        ),
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
        disabled={
          normalizeBranchName(state.branchName) === '' || state.isChecking
        }
        error={state.error}
        onBranchNameChange={(branchName) => {
          abortPreflight();
          setState((prev) =>
            prev.phase === 'confirming'
              ? {
                  ...prev,
                  branchName,
                  error: undefined,
                  isChecking: false,
                }
              : prev
          );
        }}
        onCreateBranch={handleCreateBranch}
        allowSaveToProtectedBranch={state.allowSaveToProtectedBranch}
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
          <div className='max-w-sm'>
            <EditorialWorkflowErrorBox error={state.error} />
          </div>
        </ModalBody>
      </PopupModal>
    </Modal>
  );
};
