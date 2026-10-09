import { Input } from '@tinacms/ui/components/input';
import { Textarea } from '@tinacms/ui/components/textarea';
import { cn } from '@tinacms/ui/lib/utils';
import { useId } from 'react';
import {
  controlClasses,
  DirtyMarker,
  FieldFrame,
  RequiredMarker,
} from '../field-frame';
import { ErrorIcon } from '../list/sortable-list';

export interface Locked {
  readOnly: boolean;
  disabled: boolean;
}

export function ChevronIcon({ open }: { open?: boolean }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className={cn(
        'size-4 shrink-0 text-muted-foreground transition-transform',
        open ? 'rotate-90' : null
      )}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M6 3.5 10.5 8 6 12.5' />
    </svg>
  );
}

export function ErrorCount({ count }: { count: number }) {
  return (
    <span
      data-closed-errors
      className='inline-flex shrink-0 items-center gap-1 text-xs font-medium whitespace-nowrap text-destructive'
    >
      <ErrorIcon />
      {count} {count === 1 ? 'error' : 'errors'}
    </span>
  );
}

// What a closed level says about the fields inside it. An error outranks
// Unsaved, so only one badge shows.
export function ClosedBadges({
  dirty,
  errors,
}: {
  dirty: boolean;
  errors: number;
}) {
  if (errors > 0) return <ErrorCount count={errors} />;
  return dirty ? <DirtyMarker /> : null;
}

export function GroupSection({
  label,
  summary,
  open,
  onToggle,
  dirty,
  errors,
  required,
  force,
  children,
}: {
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  dirty: boolean;
  errors: number;
  required?: boolean;
  force?: 'hover' | 'focus';
  children: React.ReactNode;
}) {
  const bodyId = useId();
  return (
    <div className='grid min-w-0 grid-cols-[minmax(0,1fr)]'>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={bodyId}
        data-force={force}
        onClick={onToggle}
        className='-mx-1 flex min-w-0 cursor-pointer flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-sm px-1 py-1 text-left outline-none hover:bg-muted/70 focus-visible:focus-ring data-[force=focus]:focus-ring data-[force=hover]:bg-muted/70'
      >
        <span className='flex max-w-full min-w-0 items-start gap-1.5'>
          <span className='flex h-5 items-center'>
            <ChevronIcon open={open} />
          </span>
          <span className='min-w-0 text-sm leading-5 font-medium break-words'>
            {label}
            {required ? <RequiredMarker /> : null}
          </span>
        </span>
        {open ? null : (
          <>
            <span className='min-w-12 flex-1 truncate text-label text-muted-foreground'>
              {summary}
            </span>
            <ClosedBadges dirty={dirty} errors={errors} />
          </>
        )}
      </button>
      {open ? (
        <div
          id={bodyId}
          className='ml-2 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 border-l border-border-subtle py-2.5 pl-3'
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

// A field inside a group or an item. The gallery shows how it sits there, not a
// new field type, so it stays a plain text input or text area.
export function NestedField({
  label,
  description,
  value,
  onChange,
  saved,
  error,
  required,
  multiline,
  locked,
  inputRef,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  saved: string | undefined;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  locked: Locked;
  inputRef?: (element: HTMLElement | null) => void;
}) {
  const flags = {
    required,
    dirty: saved !== undefined && saved !== value,
    errors: error ? [error] : [],
    disabled: locked.disabled,
    readOnly: locked.readOnly,
  };
  return (
    <FieldFrame label={label} description={description} flags={flags} nested>
      {(control) =>
        multiline ? (
          <Textarea
            {...control}
            ref={inputRef}
            rows={2}
            className={cn(
              controlClasses,
              'field-sizing-fixed h-16 resize-y overflow-y-auto'
            )}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <Input
            {...control}
            ref={inputRef}
            className={controlClasses}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      }
    </FieldFrame>
  );
}
