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
          'box-border flex w-full min-w-0 items-center gap-2 rounded-sm border-0 bg-transparent px-1 py-1.5 text-left font-sans outline-none focus-visible:shadow-focus-ring',
          inert ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted',
          disabled && 'opacity-45'
        )}
      >
        <Icon
          glyph={open ? 'chevron-down' : 'chevron-right'}
          size={14}
          className='flex-none text-muted-foreground'
        />
        <span className='flex min-w-0 flex-1 flex-col'>
          <span
            id={labelId}
            className='truncate text-base font-medium text-foreground'
          >
            {label}
          </span>
          {!open && summary ? (
            <span className='truncate text-sm text-muted-foreground'>
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
          <div className='ml-2.5 border-l-2 border-border pt-1.5 pl-3'>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type { CollapsibleProps };
export { Collapsible, invalidWords };
