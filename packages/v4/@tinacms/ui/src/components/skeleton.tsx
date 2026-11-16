import type { ComponentProps } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

const SHAPES = {
  text: 'h-3.5 w-full rounded-xs',
  block: 'rounded-sm',
  circle: 'rounded-full',
} as const;

type SkeletonProps = ComponentProps<'div'> & {
  /** `text` is one line of text; `block` and `circle` take their size from `className`. */
  shape?: keyof typeof SHAPES;
};

/** A grey placeholder shown while content loads. Hidden from screen readers. */
function Skeleton({ shape = 'text', className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot='skeleton'
      aria-hidden='true'
      className={cn('animate-pulse bg-muted', SHAPES[shape], className)}
      {...props}
    />
  );
}

export type { SkeletonProps };
export { Skeleton };
