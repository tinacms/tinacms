import { cva } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@tinacms/ui/lib/utils';

const labelVariants = cva(
  'flex items-center gap-0.5 font-sans text-base leading-5 font-medium text-foreground select-none wrap-anywhere group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-60',
  {
    variants: {
      kind: { field: '', inline: 'cursor-pointer' },
    },
    defaultVariants: { kind: 'field' },
  }
);

type LabelProps = React.ComponentProps<'label'> & {
  /** `field` names a field above its box; `inline` sits beside a checkbox. */
  kind?: 'field' | 'inline';
  /** Shows a red asterisk. Mark the control `required` too, so screen readers hear it. */
  required?: boolean;
};

function Label({
  className,
  kind = 'field',
  required = false,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      data-slot='label'
      className={cn(labelVariants({ kind }), className)}
      {...props}
    >
      {children}
      {required ? (
        <span aria-hidden='true' className='text-destructive'>
          *
        </span>
      ) : null}
    </label>
  );
}

export type { LabelProps };
export { Label };
