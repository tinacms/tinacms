'use client';

import React from 'react';

import { cn } from '@utils/cn';
import { DndPlugin } from '@platejs/dnd';
import { usePluginOption } from 'platejs/react';
import { type VariantProps, cva } from 'class-variance-authority';

// Stub hook for useBlockSelected (not exported from @platejs/selection)
const useBlockSelected = (id?: string) => false;

export const blockSelectionVariants = cva(
  'pointer-events-none absolute inset-0 z-1 bg-brand/[.13] transition-opacity',
  {
    defaultVariants: {
      active: true,
    },
    variants: {
      active: {
        false: 'opacity-0',
        true: 'opacity-100',
      },
    },
  }
);

export function BlockSelection({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof blockSelectionVariants>) {
  const isBlockSelected = useBlockSelected();
  const isDragging = usePluginOption(DndPlugin, 'isDragging');

  if (!isBlockSelected) return null;

  return (
    <div
      className={cn(
        blockSelectionVariants({
          active: isBlockSelected && !isDragging,
        }),
        className
      )}
      data-slot='block-selection'
      {...props}
    />
  );
}
