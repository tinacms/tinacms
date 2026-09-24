import type { Form } from '@toolkit/forms';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { useCMS } from '@toolkit/react-core';
import * as React from 'react';
import { EditorialWorkflowErrorMessage } from './editorial-workflow-error-box';
import {
  type EditorialWorkflowErrorCopy,
  collectionLabelResolver,
  getEditorialWorkflowError,
  messageText,
  plainMessage,
} from './editorial-workflow-utils';
import {
  type ExecuteWorkflowOptions,
  type WorkflowStep,
  runEditorialWorkflow,
} from './run-editorial-workflow';

export type EditorialWorkflowState =
  | { phase: 'idle' }
  | {
      phase: 'running';
      branchName: string;
      step: WorkflowStep;
      startedAt: number;
    };

export type StartContentSaveResult = {
  started: boolean;
  error?: EditorialWorkflowErrorCopy;
};

export type ContentSaveOptions = ExecuteWorkflowOptions & {
  onSettled?: (outcome: { success: boolean; error?: string }) => void;
};

interface EditorialWorkflowContextValue {
  state: EditorialWorkflowState;
  isExecuting: boolean;
  startContentSave: (
    opts: ContentSaveOptions
  ) => Promise<StartContentSaveResult>;
}

export const SAVE_IN_PROGRESS_MESSAGE =
  'Unavailable while your save to a new branch finishes';

const EditorialWorkflowContext =
  React.createContext<EditorialWorkflowContextValue>({
    state: { phase: 'idle' },
    isExecuting: false,
    startContentSave: async () => ({
      started: false,
      error: {
        messageParts: plainMessage('Editorial workflow is not available.'),
      },
    }),
  });

export const useEditorialWorkflowState = () =>
  React.useContext(EditorialWorkflowContext);

const adoptSavedValues = (form: Form, saved: Record<string, unknown>) => {
  const { finalForm } = form;
  const current = finalForm.getState().values;
  finalForm.batch(() => {
    finalForm.initialize(saved);
    for (const [path, value] of Object.entries(current)) {
      finalForm.change(path, value);
    }
  });
  return JSON.stringify(current) !== JSON.stringify(saved);
};

const warnBeforeUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  event.returnValue = '';
};

export const EditorialWorkflowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cms = useCMS();
  const { setCurrentBranch } = useBranchData();
  const [state, setState] = React.useState<EditorialWorkflowState>({
    phase: 'idle',
  });
  const isExecuting = state.phase === 'running';
  const busyRef = React.useRef(false);

  React.useEffect(() => {
    if (!isExecuting) return;
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isExecuting]);

  const showError = React.useCallback(
    (error: EditorialWorkflowErrorCopy) =>
      cms.alerts.error(() => <EditorialWorkflowErrorMessage error={error} />),
    [cms]
  );

  React.useEffect(() => {
    const setStep = (step: WorkflowStep) =>
      setState((prev) => (prev.phase === 'running' ? { ...prev, step } : prev));

    const offs = [
      cms.events.subscribe<{ type: string; branchName: string }>(
        'media:workflow:start',
        (event) => {
          busyRef.current = true;
          setState({
            phase: 'running',
            branchName: event.branchName,
            step: 1,
            startedAt: Date.now(),
          });
        }
      ),
      cms.events.subscribe<{ type: string; step: WorkflowStep }>(
        'media:workflow:step',
        (event) => setStep(event.step)
      ),
      cms.events.subscribe<{ type: string; branchName: string }>(
        'media:workflow:complete',
        (event) => {
          busyRef.current = false;
          setCurrentBranch(event.branchName);
          setState({ phase: 'idle' });
        }
      ),
      cms.events.subscribe<{ type: string; message: string; error?: unknown }>(
        'media:workflow:error',
        (event) => {
          busyRef.current = false;
          setState({ phase: 'idle' });
          showError(
            event.error === undefined
              ? { messageParts: plainMessage(event.message) }
              : getEditorialWorkflowError(
                  event.error,
                  collectionLabelResolver(cms.api.tina.schema)
                )
          );
        }
      ),
      cms.events.subscribe('media:workflow:finish', () => {
        busyRef.current = false;
        setState({ phase: 'idle' });
      }),
    ];
    return () => {
      for (const off of offs) off();
    };
  }, [cms, setCurrentBranch, showError]);

  const startContentSave = React.useCallback(
    ({ onSettled, ...opts }: ContentSaveOptions) =>
      new Promise<StartContentSaveResult>((resolve) => {
        if (busyRef.current) {
          resolve({
            started: false,
            error: { messageParts: plainMessage(SAVE_IN_PROGRESS_MESSAGE) },
          });
          return;
        }
        busyRef.current = true;
        const hashAtStart = window.location.hash;

        runEditorialWorkflow(cms, {
          ...opts,
          onStart: () => {
            setState({
              phase: 'running',
              branchName: opts.branchName,
              step: 1,
              startedAt: Date.now(),
            });
            resolve({ started: true });
          },
          onStep: (step) =>
            setState((prev) =>
              prev.phase === 'running' ? { ...prev, step } : prev
            ),
        }).then((outcome) => {
          busyRef.current = false;

          if (outcome.status === 'aborted') {
            resolve({ started: false });
            return;
          }

          if (outcome.status === 'failed') {
            onSettled?.({
              success: false,
              error: messageText(outcome.error.messageParts),
            });
            if (outcome.started) {
              setState({ phase: 'idle' });
              showError(outcome.error);
            } else {
              resolve({ started: false, error: outcome.error });
            }
            return;
          }

          const hasNewEdits = opts.tinaForm
            ? adoptSavedValues(opts.tinaForm, opts.values)
            : false;
          setCurrentBranch(outcome.branchName);

          if (outcome.warning) {
            cms.alerts.warn(
              `${outcome.warning} Please reconnect GitHub authoring here: ${cms.api.tina.gitSettingsLink}`,
              0
            );
          }

          if (outcome.redirectHash && window.location.hash === hashAtStart) {
            window.location.hash = outcome.redirectHash;
          }

          setState({ phase: 'idle' });
          cms.alerts.success(
            `Branch created successfully - Pull Request at ${outcome.pullRequestUrl}`,
            0
          );
          if (hasNewEdits) {
            cms.alerts.info(
              `You made changes while it was saving. Save again to add them to ${outcome.branchName}.`,
              0
            );
          }
          onSettled?.({ success: true });
        });
      }),
    [cms, setCurrentBranch, showError]
  );

  const value = React.useMemo(
    () => ({ state, isExecuting, startContentSave }),
    [state, isExecuting, startContentSave]
  );

  return (
    <EditorialWorkflowContext.Provider value={value}>
      {children}
    </EditorialWorkflowContext.Provider>
  );
};
