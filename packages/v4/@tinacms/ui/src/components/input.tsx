import { Input as InputPrimitive } from '@base-ui/react/input';
import type * as React from 'react';

import { fieldVariants } from '@tinacms/ui/lib/field-styles';
import { cn } from '@tinacms/ui/lib/utils';

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
export { Input };
