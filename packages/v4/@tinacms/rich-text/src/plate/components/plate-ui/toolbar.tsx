'use client';

import * as React from 'react';

import { cn } from '@tinacms/ui/lib/utils';
import { Icons } from './icons';
import { withTooltip } from './tooltip';

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
  const [stop, setStop] = React.useState<HTMLElement | null>(null);

  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const syncTabStops = React.useEffectEvent(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = itemsOf(root);
    const current = stop && items.includes(stop) ? stop : items[0];
    for (const item of items) {
      item.tabIndex = item === current ? 0 : -1;
    }
  });

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
  }, []);

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
        if (target.matches('[data-toolbar-item]')) setStop(target);
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

type ToolbarButtonOwnProps = {
  /** On or off, as an `aria-pressed` toggle. Leave it out for a button that is not a toggle. */
  pressed?: boolean;
  /** Draws the open look of a menu trigger. */
  open?: boolean;
  /** A chevron after the icon, for a menu trigger. */
  showArrow?: boolean;
  /** Kept for callers that mark a dropdown. */
  isDropdown?: boolean;
};

const ToolbarButtonBase = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<'button'>, 'type'> & ToolbarButtonOwnProps
>(
  (
    {
      children,
      className,
      pressed,
      open,
      showArrow,
      isDropdown: _isDropdown,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type='button'
      data-toolbar-item=''
      aria-pressed={typeof pressed === 'boolean' ? pressed : undefined}
      data-state={open ? 'open' : undefined}
      className={cn(
        'inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-sm px-1.5 font-sans text-sm font-medium text-foreground outline-none transition-colors pointer-coarse:h-10 pointer-coarse:min-w-10',
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
  )
);
ToolbarButtonBase.displayName = 'ToolbarButtonBase';

export const ToolbarButton = withTooltip(ToolbarButtonBase);
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
