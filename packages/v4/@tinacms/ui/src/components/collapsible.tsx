import { type ComponentProps, type ReactNode, useId } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type CollapsibleProps = Omit<ComponentProps<'div'>, 'children' | 'title'> & {
  /** The header words. */
  label: ReactNode;
  /** The `id` of the label, for a caller that names the content group by it. */
  labelId?: string;
  /** A short line under the label while closed. */
  summary?: ReactNode;
  /** The red count of invalid fields inside. It shows only while closed, and 0 shows nothing. */
  invalidCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Does not fold, and shows no hover. */
  disabled?: boolean;
  /** Does not fold, and shows no hover. */
  readOnly?: boolean;
  /** Runs when the header takes focus. */
  onHeaderFocus?: ComponentProps<'button'>['onFocus'];
  /** Drawn only while open, beside the guide rail. */
  children: ReactNode;
};

const invalidWords = (count: number) =>
  `${count} invalid ${count === 1 ? 'field' : 'fields'}`;

/**
 * A header that folds its content. Closed content is not in the page at all.
 * Open content sits beside a guide rail.
 */
function Collapsible({
  label,
  labelId,
  summary,
  invalidCount = 0,
  open,
  onOpenChange,
  disabled = false,
  readOnly = false,
  onHeaderFocus,
  children,
  className,
  ...props
}: CollapsibleProps) {
  const contentId = useId();
  const inert = disabled || readOnly;
  return (
    <div
      data-slot='collapsible'
      data-state={open ? 'open' : 'closed'}
      className={cn('flex min-w-0 flex-col font-sans', className)}
      {...props}
    >
      <button
        type='button'
        aria-expanded={open}
        aria-controls={contentId}
        aria-disabled={readOnly || undefined}
        disabled={disabled}
        onFocus={onHeaderFocus}
        onClick={() => {
          if (!inert) onOpenChange(!open);
        }}
        className={cn(
          'relative -mx-1 box-border flex cursor-pointer items-center gap-1.5 self-stretch rounded-sm border-0 bg-transparent p-1 text-left font-sans text-foreground outline-none focus-visible:shadow-focus-ring',
          inert ? 'cursor-not-allowed' : 'hover:bg-muted-hover',
          disabled && 'opacity-45'
        )}
      >
        <span
          className={cn(
            'flex flex-none text-muted-foreground transition-transform',
            open && 'rotate-90'
          )}
        >
          <Icon glyph='chevron-right' size={16} />
        </span>
        <span className='flex min-w-0 flex-1 items-baseline gap-1.5'>
          <span id={labelId} className='flex-none text-base font-medium'>
            {label}
          </span>
          {!open && summary ? (
            <span className='min-w-0 flex-1 truncate text-sm leading-4.5 text-muted-foreground'>
              {summary}
            </span>
          ) : null}
        </span>
        {open ? null : (
          <Badge
            kind='count'
            tone='error'
            count={invalidCount}
            srLabel={`, ${invalidWords(invalidCount)}`}
          />
        )}
      </button>
      <div id={contentId} hidden={!open}>
        {open ? (
          <div className='relative'>
            <span
              aria-hidden='true'
              className='absolute inset-y-0 left-2 w-px bg-border-subtle'
            />
            <div className='flex flex-col gap-4 py-2.5 pl-5.25'>{children}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type { CollapsibleProps };
export { Collapsible, invalidWords };
