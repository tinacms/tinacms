'use client';

import type { DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import * as React from 'react';

import {
  cn,
  createPrimitiveElement,
  withCn,
  withRef,
  withVariants,
} from '@udecode/cn';
import { cva } from 'class-variance-authority';
import { Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './dialog';
import { inputVariants } from './input';

const commandVariants = cva(
  'flex size-full flex-col rounded-md bg-popover text-popover-foreground focus-visible:outline-hidden',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        combobox: 'overflow-visible bg-transparent has-data-readonly:w-fit',
        default: 'overflow-hidden',
      },
    },
  }
);

export const Command = withVariants(CommandPrimitive, commandVariants, [
  'variant',
]);

export function CommandDialog({ children, ...props }: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className='overflow-hidden p-0 shadow-lg'>
        <DialogTitle className='sr-only'>Command Dialog</DialogTitle>
        <DialogDescription className='sr-only'>
          Search through commands and documentation using the command menu
        </DialogDescription>
        <Command className='[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5'>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = withRef<typeof CommandPrimitive.Input>(
  ({ className, ...props }, ref) => (
    <div
      className='mb-1 flex items-center border-b border-border-subtle px-2.5'
      cmdk-input-wrapper=''
    >
      <Search
        aria-hidden
        className='mr-2 size-4 shrink-0 text-muted-foreground'
      />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-sm bg-transparent py-2 text-base outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none',
          className
        )}
        {...props}
      />
    </div>
  )
);

export const InputCommand = withVariants(
  CommandPrimitive.Input,
  inputVariants,
  ['variant']
);

export const CommandList = withCn(
  CommandPrimitive.List,
  'max-h-[min(20rem,var(--radix-popover-content-available-height,20rem))] overflow-x-hidden overflow-y-auto'
);

export const CommandEmpty = withCn(
  CommandPrimitive.Empty,
  'px-2.5 py-3 text-center text-sm text-muted-foreground'
);

export const CommandGroup = withCn(
  CommandPrimitive.Group,
  'overflow-hidden p-0 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'
);

export const CommandSeparator = withCn(
  CommandPrimitive.Separator,
  '-mx-1 my-1 h-px bg-border-subtle'
);

export const CommandItem = withCn(
  CommandPrimitive.Item,
  'relative box-border flex min-h-9 w-full cursor-default items-center gap-2.5 rounded-sm px-2.5 text-base text-foreground outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-muted-foreground data-[selected=true]:bg-muted [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
);

export const CommandShortcut = withCn(
  createPrimitiveElement('span'),
  'ml-auto text-xs tracking-widest text-muted-foreground'
);
