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
          'not-tina-prose mb-3 border-l-2 border-input pl-4 text-base leading-6 text-muted-foreground last:mb-0'
        )}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
