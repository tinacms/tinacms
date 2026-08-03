import type * as React from 'react';

import { Label } from '@tinacms/ui/components/label';
import { cn } from '@tinacms/ui/lib/utils';

export interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  errors?: string[];
  className?: string;
  children: React.ReactNode;
}

function FieldWrapper({
  label,
  htmlFor,
  errors = [],
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div data-slot='field-wrapper' className={cn('grid gap-1.5', className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
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
