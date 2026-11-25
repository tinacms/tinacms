'use client';
import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

import { visualViewportBoundary } from './visual-viewport-boundary';

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverAnchor = PopoverPrimitive.Anchor;

export const popoverVariants = cva(
  'z-50 box-border max-h-(--radix-popover-content-available-height) overflow-y-auto rounded-md bg-popover text-popover-foreground shadow-popover outline-hidden print:hidden',
  {
    defaultVariants: {
      animate: true,
      variant: 'card',
    },
    variants: {
      variant: {
        card: 'w-72 border border-border-subtle p-4',
        menu: 'w-66 p-1',
      },
      animate: {
        true: 'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      },
    },
  }
);

export const PopoverContent = withRef<
  typeof PopoverPrimitive.Content,
  VariantProps<typeof popoverVariants>
>(
  (
    {
      align = 'center',
      animate,
      className,
      collisionPadding = 8,
      sideOffset = 4,
      variant,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        collisionBoundary={visualViewportBoundary()}
        className={cn(popoverVariants({ animate, variant }), className)}
        collisionPadding={collisionPadding}
        align={align}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);
