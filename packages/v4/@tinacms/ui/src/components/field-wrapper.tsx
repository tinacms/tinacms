import type * as React from 'react';

import { cn } from '@tinacms/ui/lib/utils';

export interface FieldWrapperProps {
  errors?: string[];
  className?: string;
  children: React.ReactNode;
}

function FieldWrapper({ errors = [], className, children }: FieldWrapperProps) {
  return (
    <div data-slot='field-wrapper' className={cn('grid gap-1.5', className)}>
      {children}
      {errors.map((error) => (
        <span key={error} role='alert' className='text-sm text-destructive'>
          {error}
        </span>
      ))}
    </div>
  );
}

export { FieldWrapper };
