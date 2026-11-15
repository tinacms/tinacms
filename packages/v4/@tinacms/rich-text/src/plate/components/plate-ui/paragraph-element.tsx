'use client';

import React from 'react';

import { cn } from '@tinacms/ui/lib/utils';
import { PlateElement, withRef } from '@udecode/plate/react';

export const ParagraphElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
        className={cn(
          className,
          'm-0 mb-3 text-base leading-6 last:mb-0 [li_&]:mb-0'
        )}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
