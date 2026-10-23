import type * as React from 'react';

import { fieldVariants } from '@tinacms/ui/lib/field-styles';
import { cn } from '@tinacms/ui/lib/utils';

function Textarea({
  className,
  readOnly,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      readOnly={readOnly}
      data-readonly={readOnly ? '' : undefined}
      className={cn(fieldVariants({ kind: 'textarea' }), className)}
      {...props}
    />
  );
}

export { Textarea };
