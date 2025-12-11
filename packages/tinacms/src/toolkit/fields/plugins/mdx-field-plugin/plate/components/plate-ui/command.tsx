'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import type { DialogProps } from '@radix-ui/react-dialog';

import {
  cn,
  createPrimitiveElement,
  withCn,
  withRef,
  withVariants,
} from '@udecode/cn';
import { cva, type VariantProps } from 'class-variance-authority';
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

type CommandVariantProps = VariantProps<typeof commandVariants>;
type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive> &
  CommandVariantProps;

export const Command: React.FC<CommandProps> = withVariants(
  CommandPrimitive,
  commandVariants,
  ['variant']
) as React.FC<CommandProps>;

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

export const CommandInput: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> &
    React.RefAttributes<React.ElementRef<typeof CommandPrimitive.Input>>
> = withRef<typeof CommandPrimitive.Input>(({ className, ...props }, ref) => (
  <div
    className='flex items-center border-b border-gray-200 px-3'
    cmdk-input-wrapper=''
  >
    <Search className='mr-2 size-4 shrink-0 opacity-50' />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none',
        className
      )}
      {...props}
    />
  </div>
));

type InputCommandProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
> &
  VariantProps<typeof inputVariants>;

export const InputCommand: React.FC<InputCommandProps> = withVariants(
  CommandPrimitive.Input,
  inputVariants,
  ['variant']
) as React.FC<InputCommandProps>;

type CommandListProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;

export const CommandList: React.FC<CommandListProps> = withCn(
  CommandPrimitive.List,
  'max-h-[500px] overflow-x-hidden overflow-y-auto'
) as React.FC<CommandListProps>;

type CommandEmptyProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;

export const CommandEmpty: React.FC<CommandEmptyProps> = withCn(
  CommandPrimitive.Empty,
  'py-6 text-center text-sm'
) as React.FC<CommandEmptyProps>;

type CommandGroupProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;

export const CommandGroup: React.FC<CommandGroupProps> = withCn(
  CommandPrimitive.Group,
  'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'
) as React.FC<CommandGroupProps>;

type CommandSeparatorProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;

export const CommandSeparator: React.FC<CommandSeparatorProps> = withCn(
  CommandPrimitive.Separator,
  '-mx-1 h-px bg-border'
) as React.FC<CommandSeparatorProps>;

type CommandItemProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
>;

export const CommandItem: React.FC<CommandItemProps> = withCn(
  CommandPrimitive.Item,
  'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
) as React.FC<CommandItemProps>;

type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

export const CommandShortcut: React.FC<CommandShortcutProps> = withCn(
  createPrimitiveElement('span'),
  'ml-auto text-xs tracking-widest text-muted-foreground'
) as React.FC<CommandShortcutProps>;
