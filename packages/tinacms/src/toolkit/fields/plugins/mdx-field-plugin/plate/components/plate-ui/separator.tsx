'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { withProps, withVariants } from '@udecode/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const separatorVariants = cva('shrink-0 bg-border', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
});

type SeparatorProps = React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
> &
  VariantProps<typeof separatorVariants>;

export const Separator: React.FC<SeparatorProps> = withVariants(
  withProps(SeparatorPrimitive.Root, {
    decorative: true,
    orientation: 'horizontal',
  }),
  separatorVariants
) as React.FC<SeparatorProps>;
