'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  PlateElement,
  useSelected,
  type PlateElementProps,
} from '@udecode/plate/react';

export const TableRowElement: React.FC<PlateElementProps> = React.forwardRef<
  HTMLTableRowElement,
  PlateElementProps
>(({ children, className, ...props }, ref) => {
  const selected = useSelected();

  return (
    <PlateElement
      as='tr'
      className={cn(className, 'group/row')}
      data-selected={selected ? 'true' : undefined}
      ref={ref}
      {...props}
    >
      {children}
    </PlateElement>
  );
});

TableRowElement.displayName = 'TableRowElement';
