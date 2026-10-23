import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { cva } from 'class-variance-authority';
import { type ComponentProps, useState } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

type SegmentedOption<T extends string> = { value: T; label: string };

const segmentVariants = cva(
  [
    'h-9 min-w-20 cursor-pointer rounded-full border-0 bg-transparent px-3.5 font-sans text-base leading-control font-medium text-muted-foreground-strong outline-none transition-[background-color,color,box-shadow]',
    'hover:text-foreground data-pressed:bg-card data-pressed:text-foreground data-pressed:shadow-segment',
    'focus:shadow-focus-ring data-pressed:focus:shadow-focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-45',
  ],
  {
    variants: {
      size: { md: '', sm: 'h-7 min-w-0 px-3 text-sm' },
    },
    defaultVariants: { size: 'md' },
  }
);

type SegmentedProps<T extends string> = Omit<
  ComponentProps<typeof ToggleGroup>,
  'value' | 'defaultValue' | 'onValueChange' | 'multiple' | 'children'
> & {
  /** Two to four choices. More belong in a Select. */
  options: readonly SegmentedOption<T>[];
  value?: NoInfer<T>;
  /** Defaults to the first option. */
  defaultValue?: NoInfer<T>;
  onValueChange?: (value: NoInfer<T>) => void;
  /** md is 36px high; sm is 28px, for a toolbar. */
  size?: 'md' | 'sm';
};

/** Two to four choices side by side with one picked, such as views of one list. */
function Segmented<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  className,
  ...props
}: SegmentedProps<T>) {
  const [own, setOwn] = useState(defaultValue ?? options[0]?.value);
  const picked = value ?? own;
  return (
    <ToggleGroup
      data-slot='segmented'
      value={picked === undefined ? [] : [picked]}
      onValueChange={(next) => {
        // A press on the picked choice empties the group; one choice stays picked.
        const chosen = options.find(
          (option) => option.value === next[0]
        )?.value;
        if (chosen === undefined) return;
        setOwn(chosen);
        onValueChange?.(chosen);
      }}
      className={cn(
        'inline-flex w-fit gap-0.5 rounded-full bg-muted p-0.75',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className={segmentVariants({ size })}
        >
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

export type { SegmentedOption, SegmentedProps };
export { Segmented };
