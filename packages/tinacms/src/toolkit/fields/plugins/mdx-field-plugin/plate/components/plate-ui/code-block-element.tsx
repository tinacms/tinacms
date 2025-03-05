'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate/react';
import { CodeBlock } from '../../plugins/ui/code-block';
import { useCodeBlockElementState } from '@udecode/plate-code-block/react';

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { element } = props;
    const state = useCodeBlockElementState({ element });

    return (
      <PlateElement
        className={cn('relative py-1', state.className, className)}
        ref={ref}
        {...props}
      >
        <CodeBlock {...props} />
      </PlateElement>
    );
  }
);
