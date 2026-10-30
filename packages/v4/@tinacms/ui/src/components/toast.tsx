'use client';

import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { toast as sonner } from 'sonner';

import { Button } from '@tinacms/ui/components/button';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type ToastTone = 'success' | 'error' | 'warning' | 'info' | 'neutral';
type ToastTheme = 'light' | 'dark';

type ToastAction = {
  label: string;
  onClick?: () => void;
  /** A longer name for screen readers, such as "Open About us" for a visible "Open". */
  'aria-label'?: string;
};

/** Buttons on the dark toast: light words that lift to white on hover. */
const ON_DARK =
  'text-inv-ink not-disabled:not-aria-disabled:hover:bg-inv-hover not-disabled:not-aria-disabled:hover:text-white';

const toastVariants = cva(
  'box-border flex w-full max-w-full items-start gap-2.5 rounded-md py-3 pr-2 pl-3.5 font-sans text-sm leading-control',
  {
    variants: {
      theme: {
        light: 'bg-card text-foreground shadow-toast',
        dark: 'bg-inv-bg text-white shadow-toast-dark',
      },
      oneLine: { true: 'items-center py-1.5', false: '' },
    },
    defaultVariants: { theme: 'light', oneLine: false },
  }
);

const TONE_ICON: Record<
  ToastTone,
  { glyph: Glyph; light: string; dark: string }
> = {
  success: {
    glyph: 'success',
    light: 'text-status-published',
    dark: 'text-tone-success-on-dark',
  },
  error: {
    glyph: 'error',
    light: 'text-destructive',
    dark: 'text-tone-danger-on-dark',
  },
  warning: {
    glyph: 'warning',
    light: 'text-unsaved-edge',
    dark: 'text-tone-warning-on-dark',
  },
  info: {
    glyph: 'info',
    light: 'text-tone-info',
    dark: 'text-tone-info-on-dark',
  },
  neutral: {
    glyph: 'info',
    light: 'text-muted-foreground',
    dark: 'text-inv-muted',
  },
};

type ToastProps = Omit<ComponentProps<'div'>, 'title' | 'children'> & {
  /** Sets the icon and its colour. Each tone has its own icon shape, so colour is never the only signal. */
  tone?: ToastTone;
  theme?: ToastTheme;
  title: string;
  text?: string;
  action?: ToastAction;
  /** `destructive` applies on the light theme only. */
  secondaryAction?: ToastAction & { destructive?: boolean };
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
  theme = 'light',
  title,
  text,
  action,
  secondaryAction,
  dismissible = true,
  dismissLabel = 'Dismiss',
  onDismiss,
  className,
  ...props
}: ToastProps) {
  const dark = theme === 'dark';
  const hasActions = action !== undefined || secondaryAction !== undefined;
  const oneLine = !text && !hasActions;
  const urgent = tone === 'error' || tone === 'warning';
  const destructive = Boolean(secondaryAction?.destructive) && !dark;

  return (
    <div
      data-slot='toast'
      data-tone={tone}
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      className={cn(toastVariants({ theme, oneLine }), className)}
      {...props}
    >
      <span
        className={cn(
          'inline-flex flex-none',
          TONE_ICON[tone][theme],
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
        {text ? (
          <span className={dark ? 'text-inv-muted' : 'text-muted-foreground'}>
            {text}
          </span>
        ) : null}
        {hasActions ? (
          <div className='flex flex-wrap gap-1.5 pt-2'>
            {action ? (
              dark ? (
                <Button
                  variant='ghost'
                  size='sm'
                  aria-label={action['aria-label']}
                  className={ON_DARK}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  aria-label={action['aria-label']}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )
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
                  className={dark ? ON_DARK : undefined}
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </Button>
              )
            ) : null}
          </div>
        ) : null}
      </div>
      {dismissible ? (
        <span className={cn('ml-auto flex-none', !oneLine && '-my-1')}>
          <Button
            variant='icon'
            size='sm'
            icon='close'
            aria-label={dismissLabel}
            className={dark ? ON_DARK : undefined}
            onClick={onDismiss}
          />
        </span>
      ) : null}
    </div>
  );
}

type ToastOptions = Omit<ToastProps, 'id'> & {
  /** Milliseconds, or `Infinity` to stay until the person acts. Errors and warnings stay by default. */
  duration?: number;
  id?: string | number;
};

/**
 * Shows a Toast in the Toaster and returns its id. Errors and warnings stay until dismissed.
 * Pass the same `id` to replace a toast. `onDismiss` runs however the toast closes.
 */
function toast({ duration, onDismiss, id, ...props }: ToastOptions) {
  const urgent = props.tone === 'error' || props.tone === 'warning';
  return sonner.custom(
    (toastId) => <Toast {...props} onDismiss={() => sonner.dismiss(toastId)} />,
    {
      duration: duration ?? (urgent ? Number.POSITIVE_INFINITY : undefined),
      id,
      onDismiss,
      onAutoClose: onDismiss,
    }
  );
}
toast.dismiss = sonner.dismiss;

export type { ToastAction, ToastOptions, ToastProps, ToastTheme, ToastTone };
export { Toast, toast, toastVariants };
