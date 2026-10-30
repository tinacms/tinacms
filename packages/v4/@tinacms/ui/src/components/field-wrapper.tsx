import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '@tinacms/ui/components/icon';
import { Label } from '@tinacms/ui/components/label';
import { cn } from '@tinacms/ui/lib/utils';

const messageVariants = cva(
  'm-0 flex gap-1.5 font-sans text-sm leading-field-message',
  {
    variants: {
      tone: { error: 'text-destructive', warning: 'text-unsaved' },
    },
    defaultVariants: { tone: 'error' },
  }
);

type FieldMessageProps = Omit<ComponentProps<'p'>, 'children'> & {
  /** Red and announced at once, or amber: needs a look, never blocks saving. */
  tone?: 'error' | 'warning';
  children: ReactNode;
};

function FieldMessage({
  tone = 'error',
  className,
  children,
  ...props
}: FieldMessageProps) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      data-slot='field-message'
      className={cn(messageVariants({ tone }), className)}
      {...props}
    >
      <Icon
        glyph={tone === 'error' ? 'error' : 'warning'}
        size={14}
        className='mt-0.5 flex-none'
      />
      <span className='min-w-0'>{children}</span>
    </p>
  );
}

/** The muted line under a label that says what the field is for. */
function FieldHelp({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='field-help'
      className={cn(
        'm-0 text-sm leading-field-message font-normal text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

type FieldWrapperProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Leave it out when the control brings its own, such as a checkbox with its words beside it. */
  label?: ReactNode;
  htmlFor?: string;
  /** The `id` the label gets, for a control that points at it with `aria-labelledby`. */
  labelId?: string;
  /** Adds the red asterisk. Mark the control `required` too. */
  required?: boolean;
  help?: ReactNode;
  /** The `id` of the help, so the control can point at it with `aria-describedby`. */
  helpId?: string;
  /** One message per broken rule. Set `aria-invalid` on the control too. */
  errors?: string[];
  /** Messages that need a look but never block saving. */
  warnings?: string[];
  /** Fades the whole field. Turn the control off too. */
  disabled?: boolean;
  children: ReactNode;
};

/**
 * The frame every field shares: label, help, the control, then its messages.
 * It draws no box of its own, and no unsaved marker: unsaved shows on the document.
 */
function FieldWrapper({
  label,
  htmlFor,
  labelId,
  required = false,
  help,
  helpId,
  errors = [],
  warnings = [],
  disabled = false,
  className,
  children,
  ...props
}: FieldWrapperProps) {
  const hasLabel = label !== undefined && label !== null && label !== '';
  return (
    <div
      data-slot='field-wrapper'
      data-disabled={disabled || undefined}
      className={cn(
        'flex w-full min-w-0 flex-col gap-1.5 font-sans text-base text-foreground',
        disabled && 'opacity-60',
        className
      )}
      {...props}
    >
      {hasLabel || help ? (
        <div className='flex flex-col gap-0.5'>
          {hasLabel ? (
            <Label id={labelId} htmlFor={htmlFor} required={required}>
              {label}
              {required ? <span className='sr-only'> (required)</span> : null}
            </Label>
          ) : null}
          {help ? <FieldHelp id={helpId}>{help}</FieldHelp> : null}
        </div>
      ) : null}
      {children}
      {errors.map((text) => (
        <FieldMessage key={`e-${text}`}>{text}</FieldMessage>
      ))}
      {warnings.map((text) => (
        <FieldMessage key={`w-${text}`} tone='warning'>
          {text}
        </FieldMessage>
      ))}
    </div>
  );
}

export type { FieldMessageProps, FieldWrapperProps };
export { FieldHelp, FieldMessage, FieldWrapper };
