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
import { EditorialWorkflowProgressModal } from '@toolkit/form-builder/editorial-workflow-progress-modal';

type WorkflowState =
  | { phase: 'idle' }
  | { phase: 'executing'; step: number; elapsed: number }
  | { phase: 'error'; message: string };

/**
 * Mounted once near the admin shell so every `cms.media.*` caller (Media
 * Manager, image-field plugin, future callers) gets the editorial-workflow
 * progress UI for free. The media store dispatches `media:workflow:*`
 * events; this component renders the existing `WorkflowProgressIndicator`
 * and emits `media:workflow:branch-switched` once both the React branch
 * context and `Client.branch` reflect the new branch, unblocking the store
 * to continue the media op against it.
 */
export const MediaWorkflowOverlay = () => {
  const cms = useCMS();
  const { currentBranch, setCurrentBranch } = useBranchData();

  const [state, setState] = React.useState<WorkflowState>({ phase: 'idle' });
  const [pendingBranch, setPendingBranch] = React.useState<string | null>(null);

  React.useEffect(() => {
    const offStart = cms.events.subscribe('media:workflow:start', () => {
      setState({ phase: 'executing', step: 1, elapsed: 0 });
      setPendingBranch(null);
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
      setPendingBranch(event.branchName);
      setCurrentBranch(event.branchName);
    });
    const offError = cms.events.subscribe<{ type: string; message: string }>(
      'media:workflow:error',
      (event) => {
        setState({ phase: 'error', message: event.message });
        setPendingBranch(null);
      }
    );

    return () => {
      offStart();
      offStep();
      offComplete();
      offError();
    };
  }, [cms, setCurrentBranch]);

  // Drive the elapsed-time counter while executing — same cadence as the
  // existing form-builder hook (one tick per second).
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

  // Ack the store once React state has caught up with Client.branch. The
  // BranchDataProvider's effect in TinaCloudProvider syncs Client.branch
  // from currentBranch, so we wait for *both* to match before resolving.
  React.useEffect(() => {
    if (!pendingBranch) return;
    if (currentBranch !== pendingBranch) return;
    const clientBranch = decodeURIComponent(cms.api.tina.branch || '');
    if (clientBranch !== pendingBranch) return;

    cms.events.dispatch({
      type: 'media:workflow:branch-switched',
      branchName: pendingBranch,
    });
    setPendingBranch(null);
    setState({ phase: 'idle' });
  }, [pendingBranch, currentBranch, cms]);

  if (state.phase === 'idle') return null;

  if (state.phase === 'executing') {
    return (
      <EditorialWorkflowProgressModal
        title='Preparing branch for media change'
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
