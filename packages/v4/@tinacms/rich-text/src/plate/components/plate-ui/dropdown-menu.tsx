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
import { cva } from 'class-variance-authority';

import { Icons } from './icons';

export const DropdownMenu = DropdownMenuPrimitive.Root;

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuSubTrigger = withRef<
  typeof DropdownMenuPrimitive.SubTrigger,
  {
    inset?: boolean;
  }
>(({ children, className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(
      'relative box-border flex min-h-9 w-full cursor-default items-center gap-2.5 rounded-sm px-2.5 py-0 font-sans text-base leading-control text-foreground no-underline outline-none select-none focus-visible:shadow-focus-inset data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground',
      'data-[state=open]:bg-muted',
      inset && 'pl-8',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
    <Icons.chevronRight className='ml-auto size-4' />
  </DropdownMenuPrimitive.SubTrigger>
));

export const DropdownMenuSubContent = withCn(
  DropdownMenuPrimitive.SubContent,
  'z-[99999] box-border max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-60 max-w-[var(--radix-dropdown-menu-content-available-width)] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 font-sans text-base leading-control text-foreground shadow-popover outline-none'
);

const DropdownMenuContentVariants = withProps(DropdownMenuPrimitive.Content, {
  className: cn(
    'z-[99999] box-border max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-60 max-w-[var(--radix-dropdown-menu-content-available-width)] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 font-sans text-base leading-control text-foreground shadow-popover outline-none'
  ),
  sideOffset: 4,
  collisionPadding: 8,
});

export const DropdownMenuContent = withRef<
  typeof DropdownMenuPrimitive.Content
>(({ ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuContentVariants ref={ref} {...props} />
  </DropdownMenuPrimitive.Portal>
));

const menuItemVariants = cva(
  cn(
    'relative box-border flex min-h-9 w-full cursor-default items-center gap-2.5 rounded-sm px-2.5 py-0 font-sans text-base leading-control text-foreground no-underline outline-none select-none focus-visible:shadow-focus-inset data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground'
  ),
  {
    variants: {
      inset: {
        true: 'pl-8',
      },
    },
  }
);

export const DropdownMenuItem = withVariants(
  DropdownMenuPrimitive.Item,
  menuItemVariants,
  ['inset']
);

export const DropdownMenuCheckboxItem = withRef<
  typeof DropdownMenuPrimitive.CheckboxItem
>(({ children, className, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    className={cn(
      'relative box-border flex min-h-9 w-full cursor-default items-center gap-2.5 rounded-sm px-2.5 py-0 font-sans text-base leading-control text-foreground no-underline outline-none select-none focus-visible:shadow-focus-inset data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground',
      'pr-8',
      className
    )}
    ref={ref}
    {...props}
  >
    <span className='pointer-events-none absolute right-2.5 flex size-4 items-center justify-center'>
      <DropdownMenuPrimitive.ItemIndicator>
        <Icons.check className='size-4' />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));

export const DropdownMenuRadioItem = withRef<
  typeof DropdownMenuPrimitive.RadioItem,
  {
    hideIcon?: boolean;
  }
>(({ children, className, hideIcon, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      'relative box-border flex min-h-9 w-full cursor-default items-center gap-2.5 rounded-sm px-2.5 py-0 font-sans text-base leading-control text-foreground no-underline outline-none select-none focus-visible:shadow-focus-inset data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground',
      'pr-8',
      className
    )}
    ref={ref}
    {...props}
  >
    {!hideIcon && (
      <span className='pointer-events-none absolute right-2.5 flex size-4 items-center justify-center'>
        <DropdownMenuPrimitive.ItemIndicator>
          <Icons.check className='size-4' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    )}
    {children}
  </DropdownMenuPrimitive.RadioItem>
));

const dropdownMenuLabelVariants = cva(
  cn('select-none px-2.5 py-1.5 text-xs font-medium text-muted-foreground'),
  {
    variants: {
      inset: {
        true: 'pl-8',
      },
    },
  }
);

export const DropdownMenuLabel = withVariants(
  DropdownMenuPrimitive.Label,
  dropdownMenuLabelVariants,
  ['inset']
);

export const DropdownMenuSeparator = withCn(
  DropdownMenuPrimitive.Separator,
  '-mx-1 my-1 h-px bg-border-subtle'
);

export const DropdownMenuShortcut = withCn(
  createPrimitiveElement('span'),
  'ml-auto text-xs tracking-widest opacity-60'
);

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
