import type { ComponentProps } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { BreadcrumbFold } from '@tinacms/ui/components/breadcrumb';
import { Button } from '@tinacms/ui/components/button';
import { quietControl } from '@tinacms/ui/lib/nav-styles';
import { cn } from '@tinacms/ui/lib/utils';

type FieldTrailStep = {
  label: string;
  /** Goes to that level. The last step is the level you are on and is not a button. */
  onClick?: () => void;
  /** This level holds an invalid field: a red dot after the step. */
  invalid?: boolean;
};

const crumb = cn(
  quietControl,
  'inline-flex max-w-50 items-center gap-1.5 overflow-hidden px-1 py-0.5 text-sm whitespace-nowrap'
);

/**
 * More than `max` steps (never fewer than 3) keep the first and the last two,
 * with `null` where the rest fold away. `hidden` is what folded, in order.
 */
function foldTrail<T>(
  steps: T[],
  max = 4
): { shown: (T | null)[]; hidden: T[] } {
  if (steps.length <= Math.max(3, max)) return { shown: steps, hidden: [] };
  return {
    shown: [steps[0], null, ...steps.slice(-2)],
    hidden: steps.slice(1, -2),
  };
}

function Marks({ step }: { step: FieldTrailStep }) {
  return step.invalid ? <Badge kind='dot' srLabel=', has errors' /> : null;
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
  const { shown, hidden } = foldTrail(steps, max);
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
                    crumb,
                    'cursor-default font-medium text-foreground hover:bg-transparent'
                  )}
                >
                  <span className='min-w-0 truncate'>{step.label}</span>
                  <Marks step={step} />
                </span>
              ) : (
                <button
                  type='button'
                  className={cn(crumb, 'cursor-pointer')}
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
export { FieldTrail, foldTrail };
