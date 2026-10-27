import type { ComponentProps, ReactNode } from 'react';

import {
  FieldTrail,
  type FieldTrailStep,
} from '@tinacms/ui/components/field-trail';
import { cn } from '@tinacms/ui/lib/utils';

type FormLevelProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The levels from the document down to this one. At the top level there is nowhere to go back to, so no trail shows. */
  steps?: FieldTrailStep[];
  onUp?: () => void;
  children: ReactNode;
};

/** One level of a document's fields in a single column, with the Field trail above it below the top level. */
function FormLevel({
  steps,
  onUp,
  children,
  className,
  ...props
}: FormLevelProps) {
  return (
    <div
      data-slot='form-level'
      className={cn('flex min-w-0 flex-col bg-card font-sans', className)}
      {...props}
    >
      {steps && steps.length > 1 ? (
        <FieldTrail steps={steps} onUp={onUp} />
      ) : null}
      <div className='flex min-w-0 flex-col gap-5 p-4'>{children}</div>
    </div>
  );
}

export type { FormLevelProps };
export { FormLevel };
