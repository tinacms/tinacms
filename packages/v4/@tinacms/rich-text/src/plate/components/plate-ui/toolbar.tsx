'use client';

import * as React from 'react';

import { cn } from '@tinacms/ui/lib/utils';
import { Icons } from './icons';
import { KbdShortcut } from '@tinacms/ui/components/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { ToolRowContext } from './tool-row-context';

const itemSelector = '[data-toolbar-item]:not(:disabled)';

/** The toolbar's items, in DOM order, that the arrow keys visit. */
const itemsOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(itemSelector));

/**
 * A `toolbar` with one Tab stop. ArrowLeft/ArrowRight move between items and
 * wrap, Home and End go to the first and last. Items opt in with
 * `data-toolbar-item`.
 */
export const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, onKeyDown, onFocus, children, ...props }, ref) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const stopRef = React.useRef<HTMLElement | null>(null);

  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const syncTabStops = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = itemsOf(root);
    const stop = stopRef.current;
    const current = stop && items.includes(stop) ? stop : items[0];
    for (const item of items) {
      item.tabIndex = item === current ? 0 : -1;
    }
  }, []);

  React.useLayoutEffect(() => {
    syncTabStops();
    const root = rootRef.current;
    if (!root) return;
    const observer = new MutationObserver(syncTabStops);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'data-toolbar-item'],
    });
    return () => observer.disconnect();
  }, [syncTabStops]);

  return (
    <div
      ref={rootRef}
      role='toolbar'
      aria-orientation='horizontal'
      className={cn(
        'relative flex select-none items-center gap-0.5',
        className
      )}
      onFocus={(event) => {
        onFocus?.(event);
        const target = event.target as HTMLElement;
        if (target.matches('[data-toolbar-item]')) {
          stopRef.current = target;
          syncTabStops();
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const target = event.target as HTMLElement;
        if (!target.matches('[data-toolbar-item]')) return;
        const root = rootRef.current;
        if (!root) return;
        const items = itemsOf(root);
        const at = items.indexOf(target);
        let next: number | null = null;
        if (event.key === 'ArrowRight') next = (at + 1) % items.length;
        if (event.key === 'ArrowLeft')
          next = (at - 1 + items.length) % items.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = items.length - 1;
        if (next === null) return;
        event.preventDefault();
        items[next]?.focus();
      }}
      {...props}
    >
      {children}
    </div>
  );
});
Toolbar.displayName = 'Toolbar';

export const ToolbarSeparator = ({ className }: { className?: string }) => (
  <div
    role='separator'
    aria-orientation='vertical'
    className={cn('mx-1 h-5 w-px shrink-0 bg-border', className)}
  />
);

type ToolbarButtonBaseProps = Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'type'
> & {
  pressed?: boolean;
  open?: boolean;
  showArrow?: boolean;
};

const ToolbarButtonBase = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonBaseProps
>(({ children, className, pressed, open, showArrow, ...props }, ref) => (
  <button
    ref={ref}
    type='button'
    data-toolbar-item=''
    aria-pressed={typeof pressed === 'boolean' ? pressed : undefined}
    data-state={open ? 'open' : undefined}
    className={cn(
      'inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-sm px-1.5 font-sans text-sm font-medium text-foreground outline-none transition-colors touch:h-touch touch:min-w-(--touch-height)',
      'focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-45',
      'not-disabled:hover:bg-muted aria-pressed:bg-selected not-disabled:aria-pressed:hover:bg-selected data-[state=open]:bg-muted',
      '[&_svg:not([data-icon])]:size-4',
      className
    )}
    {...props}
  >
    {children}
    {showArrow ? (
      <Icons.arrowDown data-icon className='size-3.5 text-muted-foreground' />
    ) : null}
  </button>
));
ToolbarButtonBase.displayName = 'ToolbarButtonBase';

export type ToolbarButtonProps = ToolbarButtonBaseProps & {
  tooltip?: string;
  shortcut?: string;
  /** Lets a popover trigger wrap the button inside the tooltip trigger, so both keep their hover handlers. */
  wrapTrigger?: (button: React.ReactElement) => React.ReactElement;
};

/** In line it shows a tooltip. Inside More tools it draws as a menu row and closes the panel after it runs. */
export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(
  (
    {
      tooltip,
      shortcut,
      wrapTrigger,
      'aria-label': ariaLabel,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const row = React.useContext(ToolRowContext);
    const name = ariaLabel ?? tooltip;

    if (row) {
      const rowButton = (
        <ToolbarButtonBase
          ref={ref}
          aria-label={name}
          {...props}
          onClick={(event) => {
            props.onClick?.(event);
            if (!props['aria-haspopup']) row.onRun();
          }}
          className={cn(
            'h-9 w-full justify-start gap-2.5 px-2.5 text-base font-normal touch:h-touch',
            className
          )}
        >
          <span className='flex size-4 shrink-0 items-center justify-center [&_svg]:size-4'>
            {children}
          </span>
          <span className='min-w-0 flex-1 truncate text-left'>{tooltip}</span>
          {shortcut ? <KbdShortcut keys={shortcut} size='sm' /> : null}
        </ToolbarButtonBase>
      );
      return wrapTrigger ? wrapTrigger(rowButton) : rowButton;
    }

    const base = (
      <ToolbarButtonBase
        ref={ref}
        aria-label={name}
        className={className}
        {...props}
      >
        {children}
      </ToolbarButtonBase>
    );
    const button = wrapTrigger ? wrapTrigger(base) : base;

    if (!tooltip || props.disabled) return button;

    return (
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent>
          {tooltip}
          {shortcut ? <KbdShortcut keys={shortcut} size='sm' /> : null}
        </TooltipContent>
      </Tooltip>
    );
  }
);
ToolbarButton.displayName = 'ToolbarButton';

export const ToolbarGroup = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
  noSeparator?: boolean;
}) => (
  <div className={cn('flex items-center gap-0.5', className)}>{children}</div>
);
