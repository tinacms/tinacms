import { Command as CommandPrimitive } from '@udecode/cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../../../../lib/utils'; //TODO : improve this import path (breaking vite build without ../../../../../)

type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;
type CommandRef = React.ElementRef<typeof CommandPrimitive>;

const Command: React.ForwardRefExoticComponent<
  CommandProps & React.RefAttributes<CommandRef>
> = React.forwardRef<CommandRef, CommandProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded bg-white text-popover-foreground',
        className
      )}
      {...props}
    />
  )
);
Command.displayName = CommandPrimitive.displayName;

type CommandInputProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
>;
type CommandInputRef = React.ElementRef<typeof CommandPrimitive.Input>;

const CommandInput: React.ForwardRefExoticComponent<
  CommandInputProps & React.RefAttributes<CommandInputRef>
> = React.forwardRef<CommandInputRef, CommandInputProps>(
  ({ className, ...props }, ref) => (
    <div className='flex items-center border-b px-3' cmdk-input-wrapper=''>
      <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
);

CommandInput.displayName = CommandPrimitive.Input.displayName;

type CommandListProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;
type CommandListRef = React.ElementRef<typeof CommandPrimitive.List>;

const CommandList: React.ForwardRefExoticComponent<
  CommandListProps & React.RefAttributes<CommandListRef>
> = React.forwardRef<CommandListRef, CommandListProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref}
      className={cn('overflow-x-hidden', className)}
      {...props}
    />
  )
);

CommandList.displayName = CommandPrimitive.List.displayName;

type CommandEmptyProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;
type CommandEmptyRef = React.ElementRef<typeof CommandPrimitive.Empty>;

const CommandEmpty: React.ForwardRefExoticComponent<
  CommandEmptyProps & React.RefAttributes<CommandEmptyRef>
> = React.forwardRef<CommandEmptyRef, CommandEmptyProps>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className='py-6 text-center text-sm'
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

type CommandGroupProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;
type CommandGroupRef = React.ElementRef<typeof CommandPrimitive.Group>;

const CommandGroup: React.ForwardRefExoticComponent<
  CommandGroupProps & React.RefAttributes<CommandGroupRef>
> = React.forwardRef<CommandGroupRef, CommandGroupProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);

CommandGroup.displayName = CommandPrimitive.Group.displayName;

type CommandItemProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
>;
type CommandItemRef = React.ElementRef<typeof CommandPrimitive.Item>;

const CommandItem: React.ForwardRefExoticComponent<
  CommandItemProps & React.RefAttributes<CommandItemRef>
> = React.forwardRef<CommandItemRef, CommandItemProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "hover:bg-slate-100	relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
        className
      )}
      {...props}
    />
  )
);

CommandItem.displayName = CommandPrimitive.Item.displayName;

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
};
