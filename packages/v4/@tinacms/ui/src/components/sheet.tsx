import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { cva } from 'class-variance-authority';
import type * as React from 'react';

import { Button } from '@tinacms/ui/components/button';
import { cn } from '@tinacms/ui/lib/utils';

type SheetSide = 'top' | 'right' | 'bottom' | 'left';

/** Right and left sheets are 400px wide; top and bottom sheets round their inner corners. */
const sheetVariants = cva(
  'fixed z-50 flex flex-col bg-card font-sans text-base leading-control text-foreground shadow-dialog outline-none transition-[translate,opacity] duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0',
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-full w-100 max-w-full data-ending-style:translate-x-10 data-starting-style:translate-x-10',
        left: 'inset-y-0 left-0 h-full w-100 max-w-full data-ending-style:-translate-x-10 data-starting-style:-translate-x-10',
        bottom:
          'inset-x-0 bottom-0 max-h-full rounded-t-lg data-ending-style:translate-y-10 data-starting-style:translate-y-10',
        top: 'inset-x-0 top-0 max-h-full rounded-b-lg data-ending-style:-translate-y-10 data-starting-style:-translate-y-10',
      },
    },
    defaultVariants: { side: 'right' },
  }
);

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot='sheet' {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot='sheet-trigger' {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot='sheet-close' {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot='sheet-portal' {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot='sheet-overlay'
      className={cn(
        'fixed inset-0 z-50 bg-scrim-light transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0',
        className
      )}
      {...props}
    />
  );
}

/** A panel that slides in from `side`. Compose SheetHeader, SheetBody and SheetFooter inside it. */
function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: SheetSide;
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot='sheet-content'
        data-side={side}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close
            data-slot='sheet-close'
            render={
              <Button
                variant='icon'
                size='sm'
                icon='close'
                aria-label='Close'
                className='absolute top-3 right-3'
              />
            }
          />
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn(
        'flex flex-none flex-col gap-0.5 border-b border-border-subtle py-4 pr-12 pl-5',
        className
      )}
      {...props}
    />
  );
}

/** The part of the sheet between header and footer. It scrolls on its own. */
function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-body'
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4',
        className
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn(
        'mt-auto flex flex-none flex-wrap items-center justify-end gap-2 border-t border-border-subtle px-5 py-3',
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot='sheet-title'
      className={cn(
        'font-sans text-md leading-title font-semibold text-foreground',
        className
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot='sheet-description'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export type { SheetSide };
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
};
