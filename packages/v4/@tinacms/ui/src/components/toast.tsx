'use client';

import { cva } from 'class-variance-authority';
import type { ComponentProps, CSSProperties } from 'react';
import { toast as sonner } from 'sonner';

import { Button } from '@tinacms/ui/components/button';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type ToastTone = 'success' | 'error' | 'warning' | 'info' | 'neutral';

type ToastAction = {
  label: string;
  onClick?: () => void;
  /** A longer name for screen readers, such as "Open About us" for a visible "Open". */
  'aria-label'?: string;
};

const toastVariants = cva(
  'box-border flex w-full max-w-full items-start gap-2.5 rounded-md bg-card py-3 pr-2 pl-3.5 font-sans text-sm leading-control text-foreground shadow-toast',
  {
    variants: {
      oneLine: { true: 'items-center py-1.5', false: '' },
    },
    defaultVariants: { oneLine: false },
  }
);

const TONE_ICON: Record<ToastTone, { glyph: Glyph; color: string }> = {
  success: { glyph: 'success', color: 'text-status-published' },
  error: { glyph: 'error', color: 'text-destructive' },
  warning: { glyph: 'warning', color: 'text-unsaved-edge' },
  info: { glyph: 'info', color: 'text-tone-info' },
  neutral: { glyph: 'info', color: 'text-muted-foreground' },
};

type ToastProps = Omit<ComponentProps<'div'>, 'title' | 'children'> & {
  /** Sets the icon and its colour. Each tone has its own icon shape, so colour is never the only signal. */
  tone?: ToastTone;
  title: string;
  text?: string;
  action?: ToastAction;
  secondaryAction?: ToastAction & { destructive?: boolean };
  /** The actions sit at the end of the row beside the words, instead of under them. */
  actionsInline?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
};

/**
 * A short message. Errors and warnings interrupt screen readers (role alert); the other tones
 * wait their turn (role status). Focus never moves to a toast. Show one with `toast()` inside a
 * Toaster, or place it in the page flow, where it fills its container and has no timer.
 */
function Toast({
  tone = 'success',
  title,
  text,
  action,
  secondaryAction,
  actionsInline = false,
  dismissible = true,
  dismissLabel = 'Dismiss',
  onDismiss,
  className,
  ...props
}: ToastProps) {
  const hasActions = action !== undefined || secondaryAction !== undefined;
  const oneLine = !text && !hasActions;
  const urgent = tone === 'error' || tone === 'warning';
  const destructive = Boolean(secondaryAction?.destructive);

  const actions = hasActions ? (
    <div
      className={cn(
        'flex flex-wrap gap-1.5',
        actionsInline ? 'flex-none items-center' : 'pt-2'
      )}
    >
      {action ? (
        <Button
          variant='outline'
          size='sm'
          className='h-auto min-h-8 max-w-full shrink py-1 text-left whitespace-normal touch:h-auto! touch:min-h-touch'
          aria-label={action['aria-label']}
          onClick={action.onClick}
        >
          <span className='min-w-0 [overflow-wrap:anywhere]'>
            {action.label}
          </span>
        </Button>
      ) : null}
      {secondaryAction ? (
        destructive ? (
          <Button
            variant='destructive'
            size='sm'
            aria-label={secondaryAction['aria-label']}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            aria-label={secondaryAction['aria-label']}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )
      ) : null}
    </div>
  ) : null;

  return (
    <div
      data-slot='toast'
      data-tone={tone}
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      className={cn(toastVariants({ oneLine }), className)}
      {...props}
    >
      <span
        className={cn(
          'inline-flex flex-none',
          TONE_ICON[tone].color,
          !oneLine && 'mt-px'
        )}
      >
        <Icon glyph={TONE_ICON[tone].glyph} size={16} />
      </span>
      <div
        className={cn(
          'flex min-w-0 flex-auto flex-col gap-0.5',
          !oneLine && 'pt-px'
        )}
      >
        <span
          className={cn(
            'text-pretty',
            oneLine ? 'font-medium' : 'font-semibold'
          )}
        >
          {title}
        </span>
        {text ? <span className='text-muted-foreground'>{text}</span> : null}
        {actionsInline ? null : actions}
      </div>
      {actionsInline ? actions : null}
      {dismissible ? (
        <span className={cn('ml-auto flex-none', !oneLine && '-my-1')}>
          <Button
            variant='icon'
            size='sm'
            icon='close'
            aria-label={dismissLabel}
            onClick={onDismiss}
          />
        </span>
      ) : null}
    </div>
  );
}

// Words and actions share one row, so the card is wider than the Toaster default.
const INLINE_ACTIONS_WIDTH = { '--width': '30rem' } as CSSProperties;

type ToastOptions = Omit<ToastProps, 'id'> & {
  /** Milliseconds, or `Infinity` to stay until the person acts. Errors and warnings stay by default. */
  duration?: number;
  id?: string | number;
  /**
   * Runs once when the person ends the toast: its Dismiss button or a swipe. Not when it
   * closes by itself or code calls `toast.dismiss`.
   */
  onEnd?: () => void;
};

// sonner reports a swipe and a `dismiss()` call the same way, so code dismissals are marked here.
const shown = new Set<string | number>();
const closedByCode = new Set<string | number>();

/**
 * Shows a Toast in the Toaster and returns its id. Errors and warnings stay until dismissed.
 * Pass the same `id` to replace a toast. `onDismiss` runs however the toast closes.
 */
function toast({ duration, onDismiss, onEnd, id, ...props }: ToastOptions) {
  const urgent = props.tone === 'error' || props.tone === 'warning';
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    onEnd?.();
  };
  const toastId = sonner.custom(
    (sonnerId) => (
      <Toast
        {...props}
        onDismiss={() => {
          end();
          dismiss(sonnerId);
        }}
      />
    ),
    {
      duration: duration ?? (urgent ? Number.POSITIVE_INFINITY : undefined),
      style: props.actionsInline ? INLINE_ACTIONS_WIDTH : undefined,
      id,
      onDismiss: (closed) => {
        shown.delete(closed.id);
        if (!closedByCode.delete(closed.id)) end();
        onDismiss?.();
      },
      onAutoClose: (closed) => {
        shown.delete(closed.id);
        onDismiss?.();
      },
    }
  );
  shown.add(toastId);
  closedByCode.delete(toastId);
  return toastId;
}

/** Closes one toast, or every toast, from code: `onEnd` does not run. */
function dismiss(id?: string | number) {
  for (const closed of id === undefined ? shown : [id]) {
    if (shown.has(closed)) closedByCode.add(closed);
  }
  return sonner.dismiss(id);
}
toast.dismiss = dismiss;

export type { ToastAction, ToastOptions, ToastProps, ToastTone };
export { Toast, toast, toastVariants };
