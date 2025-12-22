'use client';

import React from 'react';

import { cn, withVariants } from '@udecode/cn';
import {
  Resizable as ResizablePrimitive,
  ResizeHandle as ResizeHandlePrimitive,
} from '@udecode/plate-resizable';
import { cva, type VariantProps } from 'class-variance-authority';

export const mediaResizeHandleVariants = cva(
  cn(
    'top-0 flex w-6 select-none flex-col justify-center',
    "after:flex after:h-16 after:w-[3px] after:rounded-[6px] after:bg-ring after:opacity-0 after:content-['_'] group-hover:after:opacity-100"
  ),
  {
    variants: {
      direction: {
        left: '-left-3 -ml-3 pl-3',
        right: '-right-3 -mr-3 items-end pr-3',
      },
    },
  }
);

const resizeHandleVariants = cva(cn('absolute z-40'), {
  variants: {
    direction: {
      bottom: 'w-full cursor-row-resize',
      left: 'h-full cursor-col-resize',
      right: 'h-full cursor-col-resize',
      top: 'w-full cursor-row-resize',
    },
  },
});

type ResizeHandleVariantsProps = React.ComponentPropsWithoutRef<
  typeof ResizeHandlePrimitive
> &
  VariantProps<typeof resizeHandleVariants>;

const ResizeHandleVariants: React.FC<ResizeHandleVariantsProps> = withVariants(
  ResizeHandlePrimitive,
  resizeHandleVariants,
  ['direction']
) as React.FC<ResizeHandleVariantsProps>;

type ResizeHandleProps = React.ComponentPropsWithoutRef<
  typeof ResizeHandlePrimitive
>;

export const ResizeHandle: React.ForwardRefExoticComponent<
  ResizeHandleProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, ResizeHandleProps>((props, _ref) => (
  <ResizeHandleVariants direction={props.options?.direction} {...props} />
));

ResizeHandle.displayName = 'ResizeHandle';

const resizableVariants = cva('', {
  variants: {
    align: {
      center: 'mx-auto',
      left: 'mr-auto',
      right: 'ml-auto',
    },
  },
});

type ResizableProps = React.ComponentPropsWithoutRef<
  typeof ResizablePrimitive
> &
  VariantProps<typeof resizableVariants>;

export const Resizable: React.FC<ResizableProps> = withVariants(
  ResizablePrimitive,
  resizableVariants,
  ['align']
) as React.FC<ResizableProps>;
