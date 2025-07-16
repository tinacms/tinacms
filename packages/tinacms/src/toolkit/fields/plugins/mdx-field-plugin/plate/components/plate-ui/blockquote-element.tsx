'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate/react';

export const BlockquoteElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
        as='blockquote'
        className={cn(
          className,
          'my-1 border-l-2 border-gray-200 pl-6 not-tina-prose text-gray-500'
        )}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
