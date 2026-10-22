import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

const sideVariants = cva('', {
  variants: {
    side: {
      added: 'text-status-published',
      removed: 'text-status-failed',
      zero: 'font-medium text-muted-foreground',
    },
  },
});

const lines = (n: number) => `${n} ${n === 1 ? 'line' : 'lines'}`;
const whole = (n: number) => Math.max(0, Math.floor(n) || 0);

type DiffStatProps = Omit<ComponentProps<'span'>, 'children'> & {
  added?: number;
  removed?: number;
  size?: 'sm' | 'md';
};

/** Lines added and removed, as `+12 −3`. Screen readers hear "12 lines added, 3 lines removed". */
function DiffStat({
  added = 0,
  removed = 0,
  size = 'sm',
  className,
  ...props
}: DiffStatProps) {
  const a = whole(added);
  const r = whole(removed);
  return (
    <span
      data-slot='diff-stat'
      className={cn(
        'inline-flex flex-none items-center gap-1.5 font-mono leading-none font-semibold whitespace-nowrap tabular-nums',
        size === 'md' ? 'text-sm' : 'text-xs',
        className
      )}
      {...props}
    >
      <span
        aria-hidden='true'
        className={sideVariants({ side: a ? 'added' : 'zero' })}
      >
        +{a}
      </span>
      <span
        aria-hidden='true'
        className={sideVariants({ side: r ? 'removed' : 'zero' })}
      >
        −{r}
      </span>
      <span className='sr-only'>
        {lines(a)} added, {lines(r)} removed
      </span>
    </span>
  );
}

export type { DiffStatProps };
export { DiffStat };
