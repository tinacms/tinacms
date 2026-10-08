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
            'mt-1 mb-2 h-0.5 rounded-sm border-none bg-slate-600 bg-clip-content mx-[10%] caret-transparent',
            selected && focused && 'focus-ring',
            !readOnly && 'cursor-pointer'
          )}
        />
      </div>
      {props.children}
    </PlateElement>
  );
}
