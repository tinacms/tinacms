import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type SaveProgressPlacement = 'corner' | 'above-form-bar';

type SaveProgressProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** `corner` floats bottom right above the Status bar. `above-form-bar` sits in the flow above a form bar. */
  placement?: SaveProgressPlacement;
  /** What is saving, such as "Saving 3 documents…". */
  children?: ReactNode;
};

/**
 * The card that shows a long save while the editor keeps working. It is a named
 * region with nothing live inside: the Status bar announces the save.
 */
function SaveProgress({
  placement = 'corner',
  children = 'Saving…',
  className,
  ...props
}: SaveProgressProps) {
  return (
    <div
      role='region'
      aria-label='Save progress'
      data-slot='save-progress'
      data-placement={placement}
      className={cn(
        'box-border flex items-center gap-2.5 rounded-md bg-card py-3 pr-4 pl-3.5 font-sans text-sm leading-control text-foreground shadow-toast',
        placement === 'corner'
          ? 'fixed right-4 bottom-11 z-40 w-90 max-w-[calc(100vw-2rem)]'
          : 'w-full',
        className
      )}
      {...props}
    >
      <Icon
        glyph='spinner'
        size={16}
        className='motion-safe:animate-spin text-muted-foreground-strong'
      />
      <span className='min-w-0 truncate'>{children}</span>
    </div>
  );
}

type SaveStepState = 'pending' | 'running' | 'done' | 'failed';

type SaveStep = {
  label: ReactNode;
  state: SaveStepState;
};

type SaveProgressCardProps = Omit<
  ComponentProps<'section'>,
  'children' | 'title'
> & {
  /** `corner` floats bottom right above the Status bar. `above-form-bar` sits in the flow above a form bar. */
  placement?: SaveProgressPlacement;
  steps: SaveStep[];
  /** Time since the save began, such as "0:42". */
  elapsed?: string;
  /** Shows the running card as one bar. Esc collapses an open card. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** The running card's title and its line under it. */
  title?: string;
  subtitle?: string;
  /** A failed step: what went wrong, and the one way to go on. */
  failure?: { title?: string; text: string; onRetry: () => void };
  /** A finished save: where it landed and the pull request. */
  done?: {
    title: string;
    subtitle: ReactNode;
    pullRequest?: { label: string; status?: string; href: string };
    /** The person edited again after the save. */
    newerEdits?: { onSaveAgain: () => void };
    onDismiss?: () => void;
  };
};

const CARD =
  'box-border rounded-md bg-card font-sans text-sm leading-control text-foreground shadow-toast';

const CORNER = 'fixed right-4 bottom-11 z-40 w-90 max-w-[calc(100vw-2rem)]';

function StepMark({ state, index }: { state: SaveStepState; index: number }) {
  if (state === 'done') {
    return (
      <span className='inline-flex size-5.5 flex-none items-center justify-center rounded-full bg-status-published text-white'>
        <Icon glyph='check' size={14} />
      </span>
    );
  }
  if (state === 'failed') {
    return (
      <span className='inline-flex size-5.5 flex-none items-center justify-center rounded-full bg-status-failed-subtle text-destructive'>
        <Icon glyph='warning' size={14} />
      </span>
    );
  }
  if (state === 'running') {
    return (
      <span className='inline-flex size-5.5 flex-none items-center justify-center rounded-full border border-border'>
        <Icon
          glyph='spinner'
          size={14}
          className='motion-safe:animate-spin text-primary'
        />
      </span>
    );
  }
  return (
    <span className='inline-flex size-5.5 flex-none items-center justify-center rounded-full border border-border text-xs text-muted-foreground'>
      {index + 1}
    </span>
  );
}

function Steps({
  steps,
  failure,
}: {
  steps: SaveStep[];
  failure?: SaveProgressCardProps['failure'];
}) {
  return (
    <ol className='m-0 flex list-none flex-col gap-2 p-0'>
      {steps.map((step, index) => (
        <li key={index} className='flex items-start gap-2.5'>
          <StepMark state={step.state} index={index} />
          {step.state === 'failed' && failure ? (
            <div className='flex min-w-0 flex-1 flex-col gap-1.5 rounded-sm bg-status-failed-subtle p-2'>
              <span className='font-medium text-status-failed'>
                {step.label}
              </span>
              <span className='text-muted-foreground-strong'>
                {failure.text}
              </span>
              <span>
                <Button size='sm' onClick={failure.onRetry}>
                  Retry save
                </Button>
              </span>
            </div>
          ) : (
            <span
              className={cn(
                'pt-0.5',
                step.state === 'pending'
                  ? 'text-muted-foreground'
                  : step.state === 'running'
                    ? 'font-medium'
                    : 'text-muted-foreground-strong'
              )}
            >
              {step.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * The multi-step Save progress card: running, collapsed, failed on a step with Retry save,
 * and done with its pull request. A named region with nothing live inside, and nothing in
 * it takes focus when it appears: the Status bar announces the save.
 */
function SaveProgressCard({
  placement = 'corner',
  steps,
  elapsed,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  title = 'Saving',
  subtitle,
  failure,
  done,
  className,
  ...props
}: SaveProgressCardProps) {
  const [held, setHeld] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? held;
  const setCollapsed = (next: boolean) => {
    setHeld(next);
    onCollapsedChange?.(next);
  };
  const frame = cn(CARD, placement === 'corner' ? CORNER : 'w-full', className);
  const collapseOnEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && !isCollapsed && !done && !failure) {
      setCollapsed(true);
    }
  };

  if (done) {
    return (
      <section
        aria-label='Save progress'
        data-slot='save-progress'
        data-placement={placement}
        className={cn(frame, 'flex flex-col gap-3 p-3.5')}
        {...props}
      >
        <div className='flex items-start gap-2.5'>
          <span className='inline-flex size-8 flex-none items-center justify-center rounded-full bg-status-published-subtle text-status-published'>
            <Icon glyph='check' size={16} />
          </span>
          <div className='flex min-w-0 flex-1 flex-col'>
            <span className='font-semibold'>{done.title}</span>
            <span className='text-muted-foreground'>{done.subtitle}</span>
          </div>
          {done.onDismiss ? (
            <Button
              variant='icon'
              size='sm'
              icon='close'
              aria-label='Dismiss'
              onClick={done.onDismiss}
            />
          ) : null}
        </div>
        {done.pullRequest ? (
          <a
            href={done.pullRequest.href}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 rounded-sm border border-border px-2.5 py-2 text-foreground no-underline hover:bg-muted'
          >
            <span className='min-w-0 flex-1 truncate'>
              {done.pullRequest.label}
            </span>
            {done.pullRequest.status ? (
              <Badge kind='label'>{done.pullRequest.status}</Badge>
            ) : null}
            <Icon glyph='external' size={14} />
            <span className='sr-only'>(opens in a new tab)</span>
          </a>
        ) : null}
        {done.newerEdits ? (
          <div className='flex items-center gap-2'>
            <Badge kind='dot' />
            <span className='min-w-0 flex-1'>Edited since this save</span>
            <Button
              variant='primary'
              size='sm'
              onClick={done.newerEdits.onSaveAgain}
            >
              Save again
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  const failed = failure !== undefined;
  const current = steps.findIndex((step) => step.state !== 'done');
  const index = current === -1 ? steps.length - 1 : current;
  const toggle = (
    <Button
      variant='icon'
      size='sm'
      icon={isCollapsed ? 'chevron-up' : 'chevron-down'}
      aria-label={
        isCollapsed ? 'Expand save progress' : 'Collapse save progress'
      }
      aria-expanded={!isCollapsed}
      onClick={() => setCollapsed(!isCollapsed)}
    />
  );

  if (isCollapsed && !failed) {
    return (
      <section
        aria-label='Save progress'
        data-slot='save-progress'
        data-placement={placement}
        className={cn(
          frame,
          'flex items-center gap-2 py-1.5 pr-1.5 pl-3 text-sm'
        )}
        onKeyDown={collapseOnEscape}
        {...props}
      >
        <Icon
          glyph='spinner'
          size={16}
          className='motion-safe:animate-spin text-primary'
        />
        <span className='min-w-0 flex-1 truncate'>
          <span className='font-medium'>{steps[index]?.label}</span>
          <span className='text-muted-foreground'>
            {' · '}Step {index + 1} of {steps.length}
          </span>
        </span>
        {elapsed ? (
          <span className='text-xs text-muted-foreground tabular-nums'>
            {elapsed}
          </span>
        ) : null}
        {toggle}
      </section>
    );
  }

  return (
    <section
      aria-label='Save progress'
      data-slot='save-progress'
      data-placement={placement}
      className={cn(frame, 'flex flex-col gap-3 p-3.5')}
      onKeyDown={collapseOnEscape}
      {...props}
    >
      <div className='flex items-start gap-2'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='font-semibold'>
            {failed ? (failure.title ?? 'Couldn’t finish saving') : title}
          </span>
          <span className='text-muted-foreground'>
            {failed ? 'Nothing is lost. Your edits are still here.' : subtitle}
          </span>
        </div>
        {elapsed ? (
          <span className='pt-0.5 text-xs text-muted-foreground tabular-nums'>
            {elapsed}
          </span>
        ) : null}
        {toggle}
      </div>
      <Steps steps={steps} failure={failure} />
      {failed ? null : (
        <p className='m-0 text-muted-foreground'>
          You can keep editing. New edits go in your next save.
        </p>
      )}
    </section>
  );
}

export type {
  SaveProgressCardProps,
  SaveProgressPlacement,
  SaveProgressProps,
  SaveStep,
  SaveStepState,
};
export { SaveProgress, SaveProgressCard };
