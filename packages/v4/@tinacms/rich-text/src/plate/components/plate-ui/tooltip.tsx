'use client';

import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider as UiTooltipProvider,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { KbdShortcut } from '@tinacms/ui/components/kbd';
import { cn } from '@tinacms/ui/lib/utils';

export const TooltipProvider = UiTooltipProvider;

/** Inside it, tooltipped buttons draw as menu rows: icon, name and keycaps, with no tooltip. */
export const ToolRowContext = React.createContext(false);

type TooltipProps = {
  'aria-label'?: string;
  tooltip?: string;
  /** Keycaps shown after the name, such as `⌘B`. */
  shortcut?: string;
};

/** Adds a tooltip to a button. Its text is the control's accessible name unless `aria-label` says otherwise. */
export function withTooltip<Props extends { disabled?: boolean }>(
  Component: React.ForwardRefExoticComponent<
    Props & React.RefAttributes<HTMLButtonElement>
  >
) {
  return React.forwardRef<HTMLButtonElement, TooltipProps & Props>(
    function ExtendComponent(
      { 'aria-label': ariaLabel, tooltip, shortcut, ...props },
      ref
    ) {
      const name = ariaLabel ?? tooltip;
      const inRow = React.useContext(ToolRowContext);

      if (inRow) {
        const { children, className, ...rest } = props as unknown as Props & {
          children?: React.ReactNode;
          className?: string;
        };
        return (
          <Component
            ref={ref}
            aria-label={name}
            {...(rest as unknown as Props)}
            className={cn(
              'h-9 w-full justify-start gap-2.5 px-2.5 text-base font-normal pointer-coarse:h-10',
              className
            )}
          >
            <span className='flex size-4 shrink-0 items-center justify-center [&_svg]:size-4'>
              {children}
            </span>
            <span className='min-w-0 flex-1 truncate text-left'>{tooltip}</span>
            {shortcut ? <KbdShortcut keys={shortcut} size='sm' /> : null}
          </Component>
        );
      }

      const component = (
        <Component
          ref={ref}
          aria-label={name}
          {...(props as unknown as Props)}
        />
      );

      if (!tooltip || props.disabled) {
        return component;
      }

      return (
        <Tooltip>
          <TooltipTrigger render={component} />
          <TooltipContent>
            {tooltip}
            {shortcut ? <KbdShortcut keys={shortcut} size='sm' /> : null}
          </TooltipContent>
        </Tooltip>
      );
    }
  );
}
