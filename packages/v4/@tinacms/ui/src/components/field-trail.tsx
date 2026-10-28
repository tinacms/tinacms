import type { ComponentProps } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import {
  BreadcrumbFold,
  foldPath,
  stepVariants,
} from '@tinacms/ui/components/breadcrumb';
import { Button } from '@tinacms/ui/components/button';
import { cn } from '@tinacms/ui/lib/utils';

type FieldTrailStep = {
  label: string;
  /** Goes to that level. The last step is the level you are on and is not a button. */
  onClick?: () => void;
  /** This level holds an invalid field: a red dot after the step. */
  invalid?: boolean;
};

function Marks({ step }: { step: FieldTrailStep }) {
  return step.invalid ? (
    <Badge
      kind='dot'
      srLabel=', has errors'
      className='bg-destructive shadow-none'
    />
  ) : null;
}

type FieldTrailProps = Omit<ComponentProps<'nav'>, 'children'> & {
  /** Top level first. The last step is where you are. */
  steps: FieldTrailStep[];
  /** How many steps show before the middle folds into the ellipsis menu. */
  max?: number;
  /** What the up arrow does: back up one level. */
  onUp?: () => void;
};

/** The way back up from a nested form level: an up arrow, then the steps. Never wraps. */
function FieldTrail({
  steps,
  max = 4,
  onUp,
  className,
  ...props
}: FieldTrailProps) {
  const { shown, hidden } = foldPath(steps, Math.max(3, max));
  const parent = steps.length > 1 ? steps[steps.length - 2] : undefined;

  return (
    <nav
      data-slot='field-trail'
      aria-label='Field path'
      className={cn(
        'box-border flex min-h-11 flex-none items-center gap-0.5 border-b border-border-subtle bg-background px-2 py-1 font-sans text-base leading-control text-foreground',
        className
      )}
      {...props}
    >
      <Button
        variant='icon'
        size='sm'
        icon='arrow-left'
        aria-label={parent ? `Up to ${parent.label}` : 'Up a level'}
        onClick={onUp}
      />
      <ol className='m-0 flex min-w-0 list-none items-center overflow-hidden p-0'>
        {shown.map((step, index) => {
          const current = index === shown.length - 1;
          return (
            // Two levels can share a name, so the position is the key.
            <li
              key={index}
              className={cn(
                'flex min-w-0 items-center',
                step === null && 'flex-none'
              )}
            >
              {index > 0 ? (
                <span
                  aria-hidden='true'
                  className='flex-none px-px text-muted-foreground select-none'
                >
                  ›
                </span>
              ) : null}
              {step === null ? (
                <BreadcrumbFold
                  size='sm'
                  items={hidden.map((h) => ({
                    label: h.label,
                    onClick: h.onClick,
                    marks: <Marks step={h} />,
                  }))}
                />
              ) : current ? (
                <span
                  aria-current='location'
                  className={cn(
                    stepVariants({ size: 'sm', current: true }),
                    'inline-flex items-center gap-1.5'
                  )}
                >
                  <span className='min-w-0 truncate'>{step.label}</span>
                  <Marks step={step} />
                </span>
              ) : (
                <button
                  type='button'
                  className={cn(
                    stepVariants({ size: 'sm' }),
                    'inline-flex items-center gap-1.5'
                  )}
                  onClick={step.onClick}
                >
                  <span className='min-w-0 truncate'>{step.label}</span>
                  <Marks step={step} />
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { FieldTrailProps, FieldTrailStep };
export { FieldTrail };
