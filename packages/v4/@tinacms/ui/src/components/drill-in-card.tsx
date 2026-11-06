import { type ComponentProps, type ReactNode, useId } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import {
  invalidWords,
  RequiredMark,
} from '@tinacms/ui/components/collapsible-section';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type DrillInCardProps = Omit<
  ComponentProps<'button'>,
  'children' | 'title' | 'type'
> & {
  label: string;
  /** Shows a red asterisk after the label. */
  required?: boolean;
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
  required = false,
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
        'relative box-border flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-sm border border-border bg-card py-1.5 pr-2 pl-3 text-left font-sans text-foreground outline-none focus-visible:border-ring focus-visible:shadow-focus-ring',
        inert ? 'cursor-not-allowed' : 'hover:bg-muted-hover',
        disabled && 'opacity-60',
        className
      )}
      {...props}
    >
      <span className='flex min-w-0 flex-1 items-baseline gap-1.5'>
        <span className='min-w-0 truncate text-base font-medium'>{label}</span>
        {required ? <RequiredMark /> : null}
        {summary ? (
          <span className='min-w-0 flex-1 truncate text-sm leading-4.5 text-muted-foreground'>
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
        size={16}
        className='flex-none text-muted-foreground'
      />
    </button>
  );
}

export type { DrillInCardProps };
export { DrillInCard };
