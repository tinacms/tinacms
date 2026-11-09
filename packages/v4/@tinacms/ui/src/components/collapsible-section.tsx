import type { ComponentProps, ReactNode } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@tinacms/ui/components/collapsible';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type CollapsibleSectionProps = Omit<
  ComponentProps<'div'>,
  'children' | 'title'
> & {
  /** The header words. */
  label: ReactNode;
  /** The `id` of the label, for a caller that names the content group by it. */
  labelId?: string;
  /** Shows a red asterisk after the label. */
  required?: boolean;
  /** A short line beside the label while closed. */
  summary?: ReactNode;
  /** The red count of invalid fields inside. It shows only while closed, and 0 shows nothing. */
  invalidCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Does not fold, and shows no hover. */
  disabled?: boolean;
  /** Runs when the header takes focus. */
  onHeaderFocus?: ComponentProps<'button'>['onFocus'];
  /** Drawn only while open, beside the guide rail. */
  children: ReactNode;
};

const invalidWords = (count: number) =>
  `${count} ${count === 1 ? 'error' : 'errors'}`;

function RequiredMark() {
  return (
    <>
      <span aria-hidden='true' className='text-destructive'>
        *
      </span>
      <span className='sr-only'> (required)</span>
    </>
  );
}

function HeaderText({
  label,
  labelId,
  required,
  summary,
}: Pick<
  CollapsibleSectionProps,
  'label' | 'labelId' | 'required' | 'summary'
>) {
  return (
    <span className='flex min-w-0 flex-1 items-baseline gap-1.5'>
      <span id={labelId} className='min-w-0 truncate text-base font-medium'>
        {label}
      </span>
      {required ? <RequiredMark /> : null}
      {summary ? (
        <span className='min-w-0 flex-1 truncate text-sm leading-4.5 text-muted-foreground'>
          {summary}
        </span>
      ) : null}
    </span>
  );
}

function Rail({ children }: { children: ReactNode }) {
  return (
    <div className='relative'>
      <span
        aria-hidden='true'
        className='absolute inset-y-0 left-2 w-px bg-border-subtle'
      />
      <div className='flex flex-col gap-4 py-2.5 pl-5.25'>{children}</div>
    </div>
  );
}

/**
 * A header that folds its content. Closed content is not in the page at all.
 * Open content sits beside a guide rail.
 */
function CollapsibleSection({
  label,
  labelId,
  required,
  summary,
  invalidCount = 0,
  open,
  onOpenChange,
  disabled = false,
  onHeaderFocus,
  children,
  className,
  ...props
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        if (!disabled) onOpenChange(next);
      }}
      disabled={disabled}
      className={cn('flex min-w-0 flex-col font-sans', className)}
      {...props}
    >
      <CollapsibleTrigger
        onFocus={onHeaderFocus}
        className={cn(
          'relative -mx-1 box-border flex cursor-pointer items-center gap-1.5 self-stretch rounded-sm border-0 bg-transparent p-1 text-left font-sans text-foreground outline-none focus-visible:shadow-focus-ring',
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted-hover'
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
        <HeaderText
          label={label}
          labelId={labelId}
          required={required}
          summary={open ? null : summary}
        />
        {open ? null : (
          <Badge
            kind='count'
            tone='error'
            count={invalidCount}
            srLabel={`, ${invalidWords(invalidCount)}`}
          />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Rail>{children}</Rail>
      </CollapsibleContent>
    </Collapsible>
  );
}

export type { CollapsibleSectionProps };
export { CollapsibleSection, invalidWords, RequiredMark };
