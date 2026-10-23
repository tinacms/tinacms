import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@tinacms/ui/lib/utils';

/**
 * The field box shared by Input and Textarea. `data-readonly` marks read-only,
 * because `:read-only` also matches a disabled field.
 */
const fieldVariants = cva(
  [
    'box-border w-full min-w-0 rounded-sm border border-input bg-card px-2.5 font-sans text-base text-foreground shadow-none transition-[border-color,box-shadow] outline-none',
    'placeholder:text-muted-foreground hover:border-input-hover',
    'focus:border-ring focus:shadow-focus-field',
    'aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus:border-destructive',
    'disabled:cursor-not-allowed disabled:border-border disabled:opacity-60',
    'data-readonly:border-border-subtle data-readonly:bg-muted data-readonly:hover:border-border-subtle data-readonly:focus:border-border-subtle data-readonly:focus:shadow-none',
  ],
  {
    variants: {
      kind: {
        input: 'h-8 py-0',
        textarea:
          'field-sizing-fixed h-24 max-h-120 min-h-14 resize-y py-2 leading-5 disabled:resize-none data-readonly:resize-none',
      },
      mono: { true: 'font-mono tracking-code', false: '' },
    },
    defaultVariants: { kind: 'input', mono: false },
  }
);

type InputProps = React.ComponentProps<'input'> & {
  /** The value in the code font, such as a slug, a path or a branch name. */
  mono?: boolean;
};

function Input({ className, mono = false, readOnly, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot='input'
      readOnly={readOnly}
      data-readonly={readOnly ? '' : undefined}
      className={cn(fieldVariants({ kind: 'input', mono }), className)}
      {...props}
    />
  );
}

export type { InputProps };
export { Input, fieldVariants };
