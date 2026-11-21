import { Radio } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import type { ReactNode } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

/** One choice from a short list, one full-width row per option. Give it an `aria-label`. */
function RadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.Props<string>) {
  return (
    <RadioGroupPrimitive
      data-slot='radio-group'
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  );
}

/** A row with a radio dot and a name that wraps; the whole row picks the option. */
function RadioGroupItem({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      data-slot='radio-group-item'
      className={cn(
        'box-border flex min-h-8.5 w-full cursor-pointer items-start gap-2 rounded-sm px-2.5 py-1.5 text-base leading-control hover:bg-muted has-data-checked:bg-pressed has-data-disabled:cursor-not-allowed has-data-disabled:opacity-45 has-focus-visible:shadow-focus-ring',
        className
      )}
    >
      <Radio.Root
        value={value}
        className='mt-0.5 grid size-4 flex-none place-items-center rounded-full border border-border bg-card outline-none data-checked:border-primary'
      >
        <Radio.Indicator className='size-2 rounded-full bg-primary' />
      </Radio.Root>
      <span className='min-w-0 flex-1 font-mono tracking-code [overflow-wrap:anywhere]'>
        {children}
      </span>
    </label>
  );
}

export { RadioGroup, RadioGroupItem };
