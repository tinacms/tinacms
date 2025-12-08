import * as React from 'react';
import { withVariants } from '@udecode/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  'flex w-full rounded bg-transparent text-sm file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    defaultVariants: {
      h: 'md',
      variant: 'default',
    },
    variants: {
      h: {
        md: 'h-10 px-3 py-2',
        sm: 'h-9 px-3 py-2',
      },
      variant: {
        default:
          'border border-input ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        ghost: 'border-none focus-visible:ring-transparent',
      },
    },
  }
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>;

export const Input: React.FC<InputProps> = withVariants(
  'input',
  inputVariants,
  ['variant', 'h']
) as React.FC<InputProps>;
