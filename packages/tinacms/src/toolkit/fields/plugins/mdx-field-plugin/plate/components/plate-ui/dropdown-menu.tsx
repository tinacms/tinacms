'use client';
import React, { useCallback, useState } from 'react';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  cn,
  createPrimitiveElement,
  withCn,
  withProps,
  withRef,
  withVariants,
} from '@udecode/cn';
import { cva, type VariantProps } from 'class-variance-authority';

import { Icons } from './icons';

export const DropdownMenu = DropdownMenuPrimitive.Root;

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

type DropdownMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubTrigger
> & {
  inset?: boolean;
};

export const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<
  DropdownMenuSubTriggerProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ children, className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
      <Icons.chevronRight className='ml-auto size-4' />
    </DropdownMenuPrimitive.SubTrigger>
  )
);

type DropdownMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubContent
>;

export const DropdownMenuSubContent: React.FC<DropdownMenuSubContentProps> =
  withCn(
    DropdownMenuPrimitive.SubContent,
    'z-[99999] min-w-32 overflow-hidden rounded border bg-white p-1 text-black shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
  ) as React.FC<DropdownMenuSubContentProps>;

const DropdownMenuContentVariants = withProps(DropdownMenuPrimitive.Content, {
  className: cn(
    'z-[99999] min-w-32 overflow-hidden rounded border bg-white p-1 text-black shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
  ),
  sideOffset: 4,
});

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
>;

export const DropdownMenuContent: React.ForwardRefExoticComponent<
  DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuContentVariants ref={ref} {...props} />
    </DropdownMenuPrimitive.Portal>
  )
);

const menuItemVariants = cva(
  cn(
    'relative flex h-9 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
    'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
  ),
  {
    variants: {
      inset: {
        true: 'pl-8',
      },
    },
  }
);

type DropdownMenuItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> &
  VariantProps<typeof menuItemVariants>;

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = withVariants(
  DropdownMenuPrimitive.Item,
  menuItemVariants,
  ['inset']
) as React.FC<DropdownMenuItemProps>;

type DropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.CheckboxItem
>;

export const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<
  DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ children, className, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(
        'relative flex select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'cursor-pointer',
        className
      )}
      ref={ref}
      {...props}
    >
      <span className='absolute left-2 flex size-3.5 items-center justify-center'>
        <DropdownMenuPrimitive.ItemIndicator>
          <Icons.check className='size-4' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
);

type DropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioItem
> & {
  hideIcon?: boolean;
};

export const DropdownMenuRadioItem: React.ForwardRefExoticComponent<
  DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ children, className, hideIcon, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        'relative flex select-none items-center rounded-sm pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'h-9 cursor-pointer px-2 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground',
        className
      )}
      ref={ref}
      {...props}
    >
      {!hideIcon && (
        <span className='absolute right-2 flex size-3.5 items-center justify-center'>
          <DropdownMenuPrimitive.ItemIndicator>
            <Icons.check className='size-4' />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>
      )}
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
);

const dropdownMenuLabelVariants = cva(
  cn('select-none px-2 py-1.5 text-sm font-semibold'),
  {
    variants: {
      inset: {
        true: 'pl-8',
      },
    },
  }
);

type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
> &
  VariantProps<typeof dropdownMenuLabelVariants>;

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = withVariants(
  DropdownMenuPrimitive.Label,
  dropdownMenuLabelVariants,
  ['inset']
) as React.FC<DropdownMenuLabelProps>;

type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> =
  withCn(
    DropdownMenuPrimitive.Separator,
    '-mx-1 my-1 h-px bg-muted'
  ) as React.FC<DropdownMenuSeparatorProps>;

type DropdownMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

export const DropdownMenuShortcut: React.FC<DropdownMenuShortcutProps> = withCn(
  createPrimitiveElement('span'),
  'ml-auto text-xs tracking-widest opacity-60'
) as React.FC<DropdownMenuShortcutProps>;

export const useOpenState = () => {
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );

  return {
    onOpenChange,
    open,
  };
};
