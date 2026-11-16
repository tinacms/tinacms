import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import type { ReactNode } from 'react';
import { cn } from '@tinacms/ui/lib/utils';

/**
 * Text in a table row that shows `hint` on hover and on focus. It sits above the row's link
 * overlay, so it takes the pointer itself and opens the row on a click.
 */
export function RowHint({
  hint,
  onOpen,
  className,
  children,
}: {
  hint: string;
  onOpen: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            role='link'
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen();
              }
            }}
            className={cn(
              'relative z-10 cursor-pointer rounded-xs outline-none focus-visible:shadow-focus-ring',
              className
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
