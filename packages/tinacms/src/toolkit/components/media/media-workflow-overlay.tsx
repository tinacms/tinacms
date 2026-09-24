import { CreateBranchPromptModal } from '@toolkit/form-builder/create-branch-modal';
import {
  SAVE_IN_PROGRESS_MESSAGE,
  useEditorialWorkflowState,
} from '@toolkit/form-builder/editorial-workflow-provider';
import {
  type MediaWorkflowConfirmBranchEvent,
  TARGET_BRANCH_EXISTS_ERROR,
  checkBranchGuard,
  collectionLabelResolver,
  getEditorialWorkflowError,
  plainMessage,
} from '@toolkit/form-builder/editorial-workflow-utils';
import type { EditorialWorkflowErrorCopy } from '@toolkit/form-builder/editorial-workflow-utils';
import { useCMS } from '@toolkit/react-core';
import { normalizeBranchName } from '@utils/branch-name';
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
    };

export const MediaWorkflowOverlay = () => {
  const cms = useCMS();
  const { isExecuting } = useEditorialWorkflowState();
  const isExecutingRef = React.useRef(isExecuting);
  isExecutingRef.current = isExecuting;

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
        if (isExecutingRef.current) {
          event.onCancel();
          cms.alerts.warn(SAVE_IN_PROGRESS_MESSAGE);
          return;
        }
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

    return () => {
      offConfirm();
      abortPreflight();
    };
  }, [abortPreflight, cms]);

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
      await confirmState.onConfirm(targetBranch);
      setState({ phase: 'idle' });
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
};
