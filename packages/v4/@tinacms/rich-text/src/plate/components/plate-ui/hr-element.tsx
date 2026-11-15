'use client';

import * as React from 'react';

import type { PlateElementProps } from '@udecode/plate/react';

import { cn } from '@tinacms/ui/lib/utils';
import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from '@udecode/plate/react';

export function HrElement(props: PlateElementProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <hr
          className={cn(
            'my-4 h-px border-none bg-border caret-transparent',
            selected && focused && 'ring-2 ring-ring ring-offset-2',
            !readOnly && 'cursor-pointer'
          )}
        />
      </div>
      {props.children}
    </PlateElement>
  );
}
