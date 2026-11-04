import type { ComponentProps, ReactNode } from 'react';

import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type SaveProgressPlacement = 'corner' | 'above-form-bar';

type SaveProgressProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** `corner` floats bottom right above the Status bar. `above-form-bar` sits in the flow above a form bar. */
  placement?: SaveProgressPlacement;
  /** What is saving, such as "Saving 3 documents…". */
  children?: ReactNode;
};

/**
 * The card that shows a long save while the editor keeps working. It is a named
 * region with nothing live inside: the Status bar announces the save.
 */
function SaveProgress({
  placement = 'corner',
  children = 'Saving…',
  className,
  ...props
}: SaveProgressProps) {
  return (
    <div
      role='region'
      aria-label='Save progress'
      data-slot='save-progress'
      data-placement={placement}
      className={cn(
        'box-border flex items-center gap-2.5 rounded-md bg-card py-3 pr-4 pl-3.5 font-sans text-sm leading-control text-foreground shadow-toast',
        placement === 'corner'
          ? 'fixed right-4 bottom-11 z-40 w-90 max-w-[calc(100vw-2rem)]'
          : 'w-full',
        className
      )}
      {...props}
    >
      <Icon
        glyph='spinner'
        size={16}
        className='motion-safe:animate-spin text-muted-foreground-strong'
      />
      <span className='min-w-0 truncate'>{children}</span>
    </div>
  );
}

export type { SaveProgressPlacement, SaveProgressProps };
export { SaveProgress };
