import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';

import { cn } from '@tinacms/ui/lib/utils';
import { CheckIcon } from 'lucide-react';

/** A tick box for a value saved with the form. For a setting that applies at once, use Switch. */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs border border-input bg-card text-primary-foreground shadow-none transition-[background-color,border-color,box-shadow] outline-none after:absolute after:-inset-x-3 after:-inset-y-2 hover:border-input-hover',
        'data-checked:border-primary data-checked:bg-primary data-checked:hover:border-primary-hover data-checked:hover:bg-primary-hover',
        'focus-visible:border-ring focus-visible:shadow-focus-field data-checked:focus-visible:border-ring',
        'aria-invalid:border-destructive',
        'data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:bg-card data-disabled:text-muted-foreground data-disabled:hover:border-border data-disabled:data-checked:border-border data-disabled:data-checked:bg-card',
        'data-readonly:cursor-default data-readonly:border-border data-readonly:bg-muted data-readonly:text-foreground data-readonly:hover:border-border data-readonly:data-checked:border-border data-readonly:data-checked:bg-muted',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current transition-none [&>svg]:size-3'
      >
        <CheckIcon strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
