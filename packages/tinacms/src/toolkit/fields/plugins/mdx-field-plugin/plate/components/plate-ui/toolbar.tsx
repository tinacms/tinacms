'use client';

import * as React from 'react';

import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { cn, withCn, withVariants } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

import { Icons } from './icons';

import { Separator } from './separator';
import { withTooltip } from './tooltip';

export type ToolbarProps = React.ComponentPropsWithoutRef<
  typeof ToolbarPrimitive.Root
>;

export const Toolbar: React.ForwardRefExoticComponent<
  ToolbarProps & React.RefAttributes<HTMLDivElement>
> = withCn(
  ToolbarPrimitive.Root,
  'relative flex select-none items-center gap-1 bg-background'
) as React.ForwardRefExoticComponent<
  ToolbarProps & React.RefAttributes<HTMLDivElement>
>;

type ToolbarToggleGroupProps = React.ComponentPropsWithoutRef<
  typeof ToolbarPrimitive.ToolbarToggleGroup
>;

export const ToolbarToggleGroup: React.FC<ToolbarToggleGroupProps> = withCn(
  ToolbarPrimitive.ToolbarToggleGroup,
  'flex items-center'
) as React.FC<ToolbarToggleGroupProps>;

type ToolbarLinkProps = React.ComponentPropsWithoutRef<
  typeof ToolbarPrimitive.Link
>;

export const ToolbarLink: React.FC<ToolbarLinkProps> = withCn(
  ToolbarPrimitive.Link,
  'font-medium underline underline-offset-4'
) as React.FC<ToolbarLinkProps>;

type ToolbarSeparatorProps = React.ComponentPropsWithoutRef<
  typeof ToolbarPrimitive.Separator
>;

export const ToolbarSeparator: React.FC<ToolbarSeparatorProps> = withCn(
  ToolbarPrimitive.Separator,
  'my-1 w-px shrink-0 bg-border'
) as React.FC<ToolbarSeparatorProps>;

const toolbarButtonVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    '[&_svg:not([data-icon])]:size-5'
  ),
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-10 px-3',
        lg: 'h-11 px-5',
        sm: 'h-9 px-2',
      },
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
    },
  }
);

type ToolbarToggleItemProps = React.ComponentPropsWithoutRef<
  typeof ToolbarPrimitive.ToggleItem
> &
  VariantProps<typeof toolbarButtonVariants>;

export const ToolbarToggleItem: React.ForwardRefExoticComponent<
  ToolbarToggleItemProps & React.RefAttributes<HTMLButtonElement>
> = withVariants(ToolbarPrimitive.ToggleItem, toolbarButtonVariants, [
  'variant',
  'size',
]) as React.ForwardRefExoticComponent<
  ToolbarToggleItemProps & React.RefAttributes<HTMLButtonElement>
>;

type ToolbarButtonProps = {
  isDropdown?: boolean;
  pressed?: boolean;
  showArrow?: boolean;
  tooltip?: React.ReactNode;
} & Omit<ToolbarToggleItemProps, 'asChild' | 'value'>;

const ToolbarButtonInner = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(
  (
    {
      children,
      className,
      isDropdown = true,
      showArrow,
      pressed,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    return typeof pressed === 'boolean' ? (
      <ToolbarToggleGroup
        disabled={props.disabled}
        type='single'
        value='single'
      >
        <ToolbarToggleItem
          className={cn(
            toolbarButtonVariants({
              size,
              variant,
            }),
            isDropdown && 'my-1 justify-between',
            className
          )}
          ref={ref}
          value={pressed ? 'single' : ''}
          {...props}
        >
          {isDropdown && showArrow ? (
            <>
              <div className='flex flex-1'>{children}</div>
              <div>
                <Icons.arrowDown className='ml-0.5 size-4' data-icon />
              </div>
            </>
          ) : (
            children
          )}
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    ) : (
      <ToolbarPrimitive.Button
        className={cn(
          toolbarButtonVariants({
            size,
            variant,
          }),
          isDropdown && 'pr-1',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </ToolbarPrimitive.Button>
    );
  }
);

ToolbarButtonInner.displayName = 'ToolbarButtonInner';

const ToolbarButton: React.ForwardRefExoticComponent<
  ToolbarButtonProps & React.RefAttributes<HTMLButtonElement>
> = withTooltip(ToolbarButtonInner);

ToolbarButton.displayName = 'ToolbarButton';

export { ToolbarButton };

type ToolbarGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  noSeparator?: boolean;
};

export const ToolbarGroup: React.ForwardRefExoticComponent<
  ToolbarGroupProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ children, className, noSeparator }, ref) => {
    const childArr = React.Children.map(children, (c) => c);

    if (!childArr || childArr.length === 0) return null;

    return (
      <div className={cn('flex', className)} ref={ref}>
        {!noSeparator && (
          <div className='h-full py-1'>
            <Separator orientation='vertical' />
          </div>
        )}

        <div className='mx-1 flex items-center gap-1'>{children}</div>
      </div>
    );
  }
);

ToolbarGroup.displayName = 'ToolbarGroup';
