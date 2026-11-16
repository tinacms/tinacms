import type * as React from 'react';

import { fieldVariants } from '@tinacms/ui/lib/field-styles';
import { cn } from '@tinacms/ui/lib/utils';

type TextareaProps = React.ComponentProps<'textarea'> & {
  /** The value in the code font, such as a snippet or a path. */
  mono?: boolean;
};

function Textarea({
  className,
  mono = false,
  readOnly,
  ...props
}: TextareaProps) {
  return (
    <textarea
      data-slot='textarea'
      readOnly={readOnly}
      data-readonly={readOnly ? '' : undefined}
      className={cn(fieldVariants({ kind: 'textarea', mono }), className)}
      {...props}
    />
  );
}

export type { TextareaProps };
export { Textarea };
