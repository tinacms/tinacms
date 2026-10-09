import { cn } from '@tinacms/ui/lib/utils';
import { useId } from 'react';
import type { FrameFlags } from './states';

export interface ControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  'aria-labelledby'?: string;
  disabled?: boolean;
  readOnly?: boolean;
  'data-force'?: 'hover' | 'focus';
}

export interface FieldFrameProps {
  label: string;
  description?: string;
  flags: FrameFlags;
  layout?: 'block' | 'inline';
  showDescription?: boolean;
  labelling?: 'label' | 'group' | 'none';
  nested?: boolean;
  children: (control: ControlProps) => React.ReactNode;
}

// The frozen states force hover and focus through `data-force`. Each look sits
// beside its real pseudo-class, so the two cannot drift apart.
const interactionClasses =
  'hover:border-(--input-hover) data-[force=hover]:border-(--input-hover) data-[force=focus]:border-ring data-[force=focus]:ring-3 data-[force=focus]:ring-focus-glow';

export const controlClasses = `${interactionClasses} read-only:not-disabled:border-border-subtle read-only:not-disabled:bg-muted read-only:not-disabled:hover:border-border-subtle read-only:focus-visible:border-ring read-only:not-disabled:cursor-default read-only:[&::-webkit-calendar-picker-indicator]:hidden text-ellipsis`;

// A button matches `:read-only` too, so a trigger must not take the input looks.
export const triggerControlClasses = `${interactionClasses} data-readonly:hover:border-border-subtle`;

// The same looks for a control that sits inside an input group. The group draws
// the border, so it reads the state of the input inside it.
export const groupControlClasses =
  '[&_input]:text-ellipsis hover:border-(--input-hover) has-[[data-force=hover]]:border-(--input-hover) has-[[data-force=focus]]:border-ring has-[[data-force=focus]]:ring-3 has-[[data-force=focus]]:ring-focus-glow has-disabled:hover:border-border-subtle has-[input[readonly]]:border-border-subtle has-[input[readonly]]:bg-muted has-[input[readonly]]:hover:border-border-subtle';

// Checkboxes and radio buttons take the field focus look: an orange border and
// the glow, without the button ring's white gap and extra line.
export const markFocusClasses =
  'focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--focus-glow)]! data-[force=focus]:border-ring data-[force=focus]:shadow-[0_0_0_3px_var(--focus-glow)]!';

export const GALLERY_TOKENS = {
  '--input-hover': 'var(--tina-slate-600)',
  '--status-unsaved': '#92400e',
  '--status-unsaved-subtle': '#fffbeb',
  '--status-unsaved-mark': '#d97706',
  '--pane-width': '30rem',
  '--status-warning': '#92400e',
  '--status-warning-subtle': '#fffbeb',
} as React.CSSProperties;

const forceOf = (flags: FrameFlags) => {
  if (flags.focused) return 'focus';
  if (flags.hover) return 'hover';
  return undefined;
};

function ErrorIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className='mt-0.5 size-3.5 shrink-0'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <circle cx='8' cy='8' r='6.25' />
      <path d='M8 4.75v3.75M8 10.75v.5' strokeLinecap='round' />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className='mt-0.5 size-3.5 shrink-0'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinejoin='round'
    >
      <path d='M8 2.25 14.25 13.5H1.75L8 2.25Z' />
      <path d='M8 6.5v3M8 11.5v.25' strokeLinecap='round' />
    </svg>
  );
}

export function RequiredMarker() {
  return (
    <>
      <span aria-hidden='true' className='ml-1 text-destructive'>
        *
      </span>
      <span className='sr-only'>(required)</span>
    </>
  );
}

export function DirtyMarker() {
  return (
    <span className='ml-1.5 inline-flex h-4.5 items-center rounded-xs bg-(--status-unsaved-subtle) px-1.5 align-[1px] text-xs font-medium whitespace-nowrap text-(--status-unsaved)'>
      Unsaved
    </span>
  );
}

function DirtyBar() {
  return (
    <span
      aria-hidden='true'
      className='absolute inset-y-0 -left-4 w-0.5 rounded-full bg-(--status-unsaved-mark) opacity-50'
    />
  );
}

export function FieldFrame({
  label,
  description,
  flags,
  layout = 'block',
  showDescription = true,
  labelling = 'label',
  nested = false,
  children,
}: FieldFrameProps) {
  // Only a field in the editor pane takes the edge bar. A field inside a group
  // or an item shows its badge, and the outer field's bar covers it.
  const bar = flags.dirty && !nested ? <DirtyBar /> : null;
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorsId = `${id}-errors`;
  const warningsId = `${id}-warnings`;
  const labelId = `${id}-label`;
  const errors = flags.errors ?? [];
  const warnings = flags.warnings ?? [];
  const describedBy = [
    showDescription && description ? descriptionId : null,
    errors.length > 0 ? errorsId : null,
    warnings.length > 0 ? warningsId : null,
  ]
    .filter(Boolean)
    .join(' ');

  const control: ControlProps = {
    id,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': errors.length > 0 ? true : undefined,
    'aria-required': flags.required ? true : undefined,
    disabled: flags.disabled,
    readOnly: flags.readOnly,
    'data-force': forceOf(flags),
    'aria-labelledby': labelling === 'label' ? undefined : labelId,
  };

  // An inline label (a checkbox) toggles its control, so it takes the
  // control's cursor.
  const inlineCursor = flags.disabled
    ? 'cursor-not-allowed'
    : flags.readOnly
      ? 'cursor-default'
      : 'cursor-pointer';
  const labelClasses = cn(
    'block min-w-0 text-sm leading-5 font-medium break-words',
    flags.disabled ? 'opacity-60' : null,
    layout === 'inline' ? inlineCursor : null
  );
  const labelContent = (
    <>
      {label}
      {flags.required ? <RequiredMarker /> : null}
      {flags.dirty && errors.length === 0 ? <DirtyMarker /> : null}
    </>
  );
  const labelRow =
    labelling === 'group' ? (
      <p id={labelId} className={labelClasses}>
        {labelContent}
      </p>
    ) : (
      <label htmlFor={id} className={labelClasses}>
        {labelContent}
      </label>
    );

  const help =
    showDescription && description ? (
      <p
        id={descriptionId}
        className={
          flags.disabled
            ? 'text-label text-muted-foreground opacity-60'
            : 'text-label text-muted-foreground'
        }
      >
        {description}
      </p>
    ) : null;

  const errorList =
    errors.length > 0 ? (
      <ul
        id={errorsId}
        className={flags.disabled ? 'grid gap-1 opacity-60' : 'grid gap-1'}
      >
        {errors.map((error) => (
          <li key={error}>
            <p
              role='alert'
              className='flex gap-1.5 text-label text-destructive'
            >
              <ErrorIcon />
              {error}
            </p>
          </li>
        ))}
      </ul>
    ) : null;

  const warningList =
    warnings.length > 0 ? (
      <ul
        id={warningsId}
        className={flags.disabled ? 'grid gap-1 opacity-60' : 'grid gap-1'}
      >
        {warnings.map((warning) => (
          <li key={warning}>
            <p
              role='status'
              className='flex gap-1.5 text-label text-(--status-warning)'
            >
              <WarningIcon />
              <span className='min-w-0 break-words'>{warning}</span>
            </p>
          </li>
        ))}
      </ul>
    ) : null;

  if (layout === 'inline') {
    return (
      <div className='relative grid gap-1.5'>
        {bar}
        <div className='flex items-start gap-2.5'>
          <span className='flex h-5 items-center'>{children(control)}</span>
          <div className='grid min-w-0 gap-0.5'>
            {labelRow}
            {help}
          </div>
        </div>
        {errorList}
        {warningList}
      </div>
    );
  }

  return (
    <div className='relative grid min-w-0 gap-1.5'>
      {bar}
      {labelling === 'none' ? (
        // A field with no visible label still has a name.
        <span id={labelId} className='sr-only'>
          {label}
        </span>
      ) : (
        <div className='grid gap-0.5'>
          {labelRow}
          {help}
        </div>
      )}
      {children(control)}
      {errorList}
      {warningList}
    </div>
  );
}
