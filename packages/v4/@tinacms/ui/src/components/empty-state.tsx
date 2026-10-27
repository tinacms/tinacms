import { type VariantProps, cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { Empty } from '@tinacms/ui/components/empty';
import { cn } from '@tinacms/ui/lib/utils';

const emptyStateVariants = cva(
  'box-border gap-2 rounded-md border border-dashed border-border px-4 py-3 font-sans text-sm leading-normal text-pretty text-muted-foreground',
  {
    variants: {
      /** inline sits in a list, block holds the place of a panel, plain sits inside a table. */
      variant: {
        inline: '',
        block: 'min-h-65 p-6',
        plain: 'border-0 px-4 py-6',
      },
      align: {
        center: '',
        left: 'items-start text-left',
      },
    },
    defaultVariants: { variant: 'inline', align: 'center' },
  }
);

type EmptyStateProps = Omit<ComponentProps<'div'>, 'children'> &
  VariantProps<typeof emptyStateVariants> & {
    /** The one sentence, such as "Nothing unsaved." */
    text: string;
    /** The words of the one way out, such as "Clear filters". Shows only with `onAction`. */
    actionLabel?: string;
    onAction?: () => void;
    /** Announces the sentence when it appears, such as after a filter empties a table. */
    live?: boolean;
  };

/**
 * What a list, table or panel shows when it has nothing in it: one plain sentence and at most one
 * way out, drawn as a link after the sentence. No illustration: a sentence that says what to do
 * next does more.
 */
function EmptyState({
  text,
  variant,
  align,
  actionLabel,
  onAction,
  live = false,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <Empty
      role={live ? 'status' : undefined}
      className={cn(emptyStateVariants({ variant, align }), className)}
      {...props}
    >
      <p className='m-0 inline'>
        {text}
        {actionLabel && onAction ? (
          <button
            type='button'
            onClick={onAction}
            className='ml-1 cursor-pointer rounded-xs border-0 bg-transparent p-0 font-sans text-sm text-primary underline underline-offset-2 outline-none hover:text-primary-hover focus-visible:shadow-focus-ring'
          >
            {actionLabel}
          </button>
        ) : null}
      </p>
    </Empty>
  );
}

export type { EmptyStateProps };
export { EmptyState, emptyStateVariants };
