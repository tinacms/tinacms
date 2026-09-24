import { cn } from '@utils/cn';
import {
  CircleAlert,
  CircleCheck,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import * as React from 'react';
import { EditorialWorkflowErrorBox } from './editorial-workflow-error-box';
import type { EditorialWorkflowState } from './editorial-workflow-provider';
import {
  WORKFLOW_STEPS,
  type WorkflowStep,
  formatTime,
} from './run-editorial-workflow';
import { WorkflowProgressIndicator } from './workflow-progress-indicator';

const useElapsedSeconds = (startedAt: number | undefined) => {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (startedAt === undefined) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  return startedAt === undefined
    ? 0
    : Math.max(0, Math.floor((now - startedAt) / 1000));
};

const IconButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type='button'
    aria-label={label}
    title={label}
    onClick={onClick}
    className='flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150'
  >
    {children}
  </button>
);

const CompactSteps = ({ step }: { step: WorkflowStep }) => (
  <div className='flex gap-1.5 px-4 pb-3'>
    {WORKFLOW_STEPS.map(({ id, name }) => {
      const done = id < step;
      const active = id === step;
      return (
        <div key={id} className='flex-1 min-w-0'>
          <div className='h-1 rounded-full bg-gray-200 overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-500',
                done && 'w-full bg-green-500',
                active && 'w-1/2 bg-tina-orange animate-pulse',
                !done && !active && 'w-0'
              )}
            />
          </div>
          <div
            className={cn(
              'mt-1 text-[11px] truncate',
              active ? 'text-gray-900 font-semibold' : 'text-gray-400'
            )}
          >
            {name}
          </div>
        </div>
      );
    })}
  </div>
);

export const EditorialWorkflowWidget = ({
  state,
  onDismiss,
}: {
  state: EditorialWorkflowState;
  onDismiss: () => void;
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const running = state.phase === 'running';
  const elapsed = useElapsedSeconds(running ? state.startedAt : undefined);

  React.useEffect(() => {
    if (!running) setExpanded(false);
  }, [running]);

  if (state.phase === 'idle') return null;

  const stepName =
    running && state.step <= WORKFLOW_STEPS.length
      ? WORKFLOW_STEPS[state.step - 1].name
      : 'Finishing up';

  return (
    <>
      {expanded && (
        <div
          className='fixed inset-0 z-overlay bg-gray-900/25'
          onClick={() => setExpanded(false)}
        />
      )}
      <section
        aria-live='polite'
        aria-label='Save to new branch progress'
        className={cn(
          'fixed z-overlay bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden',
          expanded
            ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(560px,calc(100vw-2rem))]'
            : 'right-4 bottom-4 w-[min(340px,calc(100vw-2rem))]'
        )}
      >
        <div className='flex items-center gap-3 px-4 py-3'>
          {running && (
            <Loader2 className='w-5 h-5 flex-shrink-0 animate-spin text-tina-orange' />
          )}
          {state.phase === 'success' && (
            <CircleCheck className='w-5 h-5 flex-shrink-0 text-green-600' />
          )}
          {state.phase === 'error' && (
            <CircleAlert className='w-5 h-5 flex-shrink-0 text-red-500' />
          )}
          <div className='min-w-0'>
            <div className='text-sm font-semibold text-gray-900'>
              {running && 'Saving to a new branch'}
              {state.phase === 'success' && 'Saved to a new branch'}
              {state.phase === 'error' && "Couldn't save to a new branch"}
            </div>
            {state.phase !== 'error' && (
              <div className='text-xs text-gray-500 truncate'>
                {state.branchName}
                {running &&
                  ` · Step ${Math.min(state.step, 3)} of 3: ${stepName}`}
              </div>
            )}
          </div>
          <div className='ml-auto flex items-center gap-1'>
            {running ? (
              <>
                <span className='text-xs text-gray-500 tabular-nums mr-1'>
                  {formatTime(elapsed)}
                </span>
                <IconButton
                  label={expanded ? 'Collapse' : 'Expand'}
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? (
                    <Minimize2 className='w-4 h-4' />
                  ) : (
                    <Maximize2 className='w-4 h-4' />
                  )}
                </IconButton>
              </>
            ) : (
              <IconButton label='Dismiss' onClick={onDismiss}>
                <X className='w-4 h-4' />
              </IconButton>
            )}
          </div>
        </div>

        {running &&
          (expanded ? (
            <div className='px-6 pb-5'>
              <WorkflowProgressIndicator
                currentStep={state.step}
                isExecuting
                elapsedTime={elapsed}
              />
              <p className='mt-4 text-xs text-gray-500 bg-gray-50 rounded px-3 py-2'>
                Keep editing if you like. Saving, switching branch and uploading
                media unlock when this finishes.
              </p>
            </div>
          ) : (
            <CompactSteps step={state.step} />
          ))}

        {state.phase === 'success' && (
          <div className='px-4 pb-4 text-xs text-gray-700'>
            <div className='bg-green-50 text-green-800 rounded px-3 py-2'>
              {state.pullRequestUrl ? (
                <>
                  Your{' '}
                  <a
                    className='underline font-medium'
                    href={state.pullRequestUrl}
                    target='_blank'
                    rel='noreferrer'
                  >
                    pull request
                  </a>{' '}
                  is open.
                </>
              ) : (
                'Your pull request is open.'
              )}
              {state.hasNewEdits &&
                ' You made changes while it was saving. Save again to add them to this branch.'}
            </div>
          </div>
        )}

        {state.phase === 'error' && (
          <div className='px-4 pb-1'>
            <EditorialWorkflowErrorBox error={state.error} />
          </div>
        )}
      </section>
    </>
  );
};
