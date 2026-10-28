import { cn } from '@tinacms/ui/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { Button } from '@tinacms/ui/components/button';
import { Input } from '@tinacms/ui/components/input';
import { Textarea } from '@tinacms/ui/components/textarea';

/** The box draws the field states; the control inside draws none of its own. */
const inputGroupVariants = cva(
  [
    'group/input-group relative box-border flex w-full min-w-0 items-center rounded-sm border border-input bg-card font-sans text-base text-muted-foreground transition-[border-color,box-shadow] outline-none hover:border-input-hover',
    'has-[[data-slot=input-group-control]:focus]:border-ring has-[[data-slot=input-group-control]:focus]:shadow-focus-field',
    'has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:hover:border-destructive',
    'has-disabled:border-border has-disabled:opacity-60 has-disabled:hover:border-border',
    'has-[[data-slot=input-group-control][data-readonly]]:border-border-subtle has-[[data-slot=input-group-control][data-readonly]]:bg-muted has-[[data-slot=input-group-control][data-readonly]]:shadow-none has-[[data-slot=input-group-control][data-readonly]]:hover:border-border-subtle',
    'in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:shadow-none',
    'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto',
  ],
  {
    variants: {
      size: { md: 'min-h-8', sm: 'min-h-7' },
    },
    defaultVariants: { size: 'md' },
  }
);

type InputGroupProps = React.ComponentProps<'div'> &
  VariantProps<typeof inputGroupVariants>;

function InputGroup({ className, size = 'md', ...props }: InputGroupProps) {
  return (
    <div
      data-slot='input-group'
      data-size={size}
      role='group'
      className={cn(inputGroupVariants({ size }), className)}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-1.5 font-sans text-base font-normal text-muted-foreground select-none group-focus-within/input-group:*:data-[slot=icon]:text-foreground [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'inline-start': 'order-first pr-0.5 pl-2.5',
        'inline-end': 'order-last pr-1.5 pl-0.5',
        'block-start':
          'order-first w-full justify-start px-2.5 pt-2 [.border-b]:pb-2',
        'block-end':
          'order-last w-full justify-start px-2.5 pb-2 [.border-t]:pt-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
);

/** A click on the addon focuses the input, unless it lands on a button. */
function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role='group'
      data-slot='input-group-addon'
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if (e.target instanceof Element && e.target.closest('button')) {
          return;
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  'rounded-xs font-sans text-sm font-medium text-muted-foreground-strong shadow-none hover:bg-muted hover:text-foreground',
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: 'h-7 px-2',
        'icon-xs': 'size-6 p-0',
        'icon-sm': 'size-7 p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  }
);

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size' | 'type'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: 'button' | 'submit' | 'reset';
  }) {
  return (
    <Button
      type={type}
      data-slot='input-group-button'
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

/** Quiet words in an addon, such as a unit (`px`) or a prefix (`https://`). */
function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-sans text-sm whitespace-nowrap text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

const CONTROL_RESET =
  'flex-1 rounded-none border-0 bg-transparent shadow-none focus:shadow-none disabled:opacity-100 data-readonly:bg-transparent';

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot='input-group-control'
      className={cn(
        CONTROL_RESET,
        'h-7.5 group-data-[size=sm]/input-group:h-6.5 group-data-[size=sm]/input-group:text-sm',
        className
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot='input-group-control'
      className={cn(CONTROL_RESET, 'resize-none', className)}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
