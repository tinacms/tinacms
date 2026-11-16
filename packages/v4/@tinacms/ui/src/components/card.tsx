import type { ComponentProps } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

/** A white surface with a light border. Callers add their own padding, layout and states. */
function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='card'
      className={cn(
        'flex flex-col rounded-md border border-border bg-card text-card-foreground',
        className
      )}
      {...props}
    />
  );
}

export { Card };
