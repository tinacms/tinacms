import { type ComponentProps, type ReactNode, useId } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { invalidWords } from '@tinacms/ui/components/collapsible';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type DrillInCardProps = Omit<
  ComponentProps<'button'>,
  'children' | 'title' | 'type'
> & {
  label: string;
  /** A short line under the label. */
  summary?: ReactNode;
  /** The red count of invalid fields inside. 0 shows nothing. */
  invalidCount?: number;
  /** Does not open, and shows no hover. */
  readOnly?: boolean;
  onOpen: () => void;
};

/**
 * A card that opens its content as the next form level. The button is named
 * `Open {label}`; the invalid count is its description.
 */
function DrillInCard({
  label,
  summary,
  invalidCount = 0,
  readOnly = false,
  disabled = false,
  onOpen,
  className,
  ...props
}: DrillInCardProps) {
  const descriptionId = useId();
  const inert = disabled || readOnly;
  return (
    <button
      type='button'
      data-slot='drill-in-card'
      aria-label={`Open ${label}`}
      aria-describedby={invalidCount > 0 ? descriptionId : undefined}
      aria-disabled={readOnly || undefined}
      disabled={disabled}
      onClick={() => {
        if (!inert) onOpen();
      }}
      className={cn(
        'box-border flex w-full min-w-0 items-center gap-2 rounded-sm border border-input bg-card px-3 py-2 text-left font-sans shadow-xs outline-none focus-visible:border-ring focus-visible:shadow-focus-field',
        inert ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted',
        disabled && 'opacity-45 shadow-none',
        className
      )}
      {...props}
    >
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='truncate text-base font-medium text-foreground'>
          {label}
        </span>
        {summary ? (
          <span className='truncate text-sm text-muted-foreground'>
            {summary}
          </span>
        ) : null}
      </span>
      <Badge kind='count' tone='error' count={invalidCount} srLabel='' />
      {invalidCount > 0 ? (
        <span id={descriptionId} className='sr-only'>
          {invalidWords(invalidCount)}
        </span>
      ) : null}
      <Icon
        glyph='chevron-right'
        size={14}
        className='flex-none text-muted-foreground'
      />
    </button>
  );
}

export type { DrillInCardProps };
export { DrillInCard };
