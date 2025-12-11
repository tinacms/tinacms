'use client';

import React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { withCn, withProps } from '@udecode/cn';

export const TooltipProvider: React.FC<TooltipPrimitive.TooltipProviderProps> =
  TooltipPrimitive.Provider;

export const Tooltip: React.FC<TooltipPrimitive.TooltipProps> =
  TooltipPrimitive.Root;

export const TooltipTrigger: React.FC<TooltipPrimitive.TooltipTriggerProps> =
  TooltipPrimitive.Trigger;

export const TooltipPortal: React.FC<TooltipPrimitive.TooltipPortalProps> =
  TooltipPrimitive.Portal;

type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
>;

export const TooltipContent: React.FC<TooltipContentProps> = withCn(
  withProps(TooltipPrimitive.Content, {
    sideOffset: 4,
  }),
  'z-[9999] overflow-hidden rounded border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md'
) as React.FC<TooltipContentProps>;

export function withTooltip<
  T extends React.ComponentType<any> | keyof HTMLElementTagNameMap,
>(
  Component: T
): React.ForwardRefExoticComponent<
  {
    tooltip?: React.ReactNode;
    tooltipContentProps?: Omit<
      React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
      'children'
    >;
    tooltipProps?: Omit<
      React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
      'children'
    >;
  } & React.ComponentPropsWithoutRef<T> &
    React.RefAttributes<React.ElementRef<T>>
> {
  return React.forwardRef<
    React.ElementRef<T>,
    {
      tooltip?: React.ReactNode;
      tooltipContentProps?: Omit<
        React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
        'children'
      >;
      tooltipProps?: Omit<
        React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
        'children'
      >;
    } & React.ComponentPropsWithoutRef<T>
  >(function ExtendComponent(
    { tooltip, tooltipContentProps, tooltipProps, ...props },
    ref
  ) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const component = <Component ref={ref} {...(props as any)} />;

    if (tooltip && mounted) {
      return (
        <Tooltip {...tooltipProps}>
          <TooltipTrigger asChild>{component}</TooltipTrigger>

          <TooltipPortal>
            <TooltipContent {...tooltipContentProps}>{tooltip}</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      );
    }

    return component;
  }) as any;
}
