import type { ComponentProps } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

/** A centred column for what a list, table or panel shows when it has nothing in it. */
function Empty({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='empty'
      className={cn(
        'flex w-full min-w-0 flex-col items-center justify-center text-center',
        className
      )}
      {...props}
    />
  );
}

export { Empty };
