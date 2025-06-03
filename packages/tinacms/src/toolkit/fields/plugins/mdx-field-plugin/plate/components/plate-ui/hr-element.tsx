'use client';

import * as React from 'react';

import type { PlateElementProps } from '@udecode/plate/react';

import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from '@udecode/plate/react';
import { cn } from '@udecode/cn';

export function HrElement(props: PlateElementProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <hr
          className={cn(
            'm-0 h-0.5 rounded-sm border-none bg-gray-400 bg-clip-content',
            selected && focused && 'ring-2 ring-ring ring-offset-2',
            !readOnly && 'cursor-pointer'
          )}
        />
      </div>
      {props.children}
    </PlateElement>
  );
}