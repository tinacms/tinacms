'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { PlateElement, type PlateElementProps } from '@udecode/plate/react';

export const ParagraphElement: React.FC<PlateElementProps> = React.forwardRef<
  HTMLElement,
  PlateElementProps
>(({ children, className, ...props }, ref) => {
  return (
    <PlateElement
      ref={ref}
      className={cn(className, 'm-0 px-0 py-1')}
      {...props}
    >
      {children}
    </PlateElement>
  );
});

ParagraphElement.displayName = 'ParagraphElement';
