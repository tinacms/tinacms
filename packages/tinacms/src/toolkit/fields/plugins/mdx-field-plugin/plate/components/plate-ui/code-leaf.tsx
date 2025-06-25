'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate-common';

export const CodeLeaf = withRef<typeof PlateLeaf>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateLeaf
        asChild
        className={cn(
          'whitespace-pre-wrap rounded bg-muted px-[0.3em] py-[0.2em] font-mono text-sm',
          className
        )}
        ref={ref}
        {...props}
      >
        <code>{children}</code>
      </PlateLeaf>
    );
  }
);
