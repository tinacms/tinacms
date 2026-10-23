import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@tinacms/ui/lib/utils';

import { Button } from '@tinacms/ui/components/button';

const dialogOverlayClasses =
  'fixed inset-0 isolate z-50 bg-scrim transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0';

/** The card that Dialog and AlertDialog share: 20px corners, the dialog shadow and a width from `size`. */
const dialogVariants = cva(
  [
    'fixed inset-4 z-50 m-auto flex h-fit max-h-full w-auto flex-col gap-4 overflow-y-auto rounded-lg bg-popover p-6 font-sans text-base leading-control text-foreground shadow-dialog outline-none',
    'transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
  ],
  {
    variants: { size: { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl' } },
    defaultVariants: { size: 'md' },
  }
);

const dialogTitleClasses =
  'font-sans text-md leading-title font-semibold text-foreground';

const dialogDescriptionClasses =
  'text-base text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground';

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot='dialog-overlay'
      className={cn(dialogOverlayClasses, className)}
      {...props}
    />
  );
}

/** sm 384px, md 448px (default) or lg 576px wide, and never wider than the screen. */
function DialogContent({
  className,
  children,
  size,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props &
  VariantProps<typeof dialogVariants> & {
    showCloseButton?: boolean;
  }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot='dialog-content'
        data-close-button={showCloseButton ? '' : undefined}
        className={cn(dialogVariants({ size }), 'group/dialog', className)}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot='dialog-close'
            render={
              <Button
                variant='icon'
                size='sm'
                icon='close'
                aria-label='Close'
                className='absolute top-4 right-4'
              />
            }
          />
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn(
        'flex flex-col gap-1 group-data-close-button/dialog:pr-8',
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex flex-wrap items-center justify-end gap-2 pt-2',
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close render={<Button variant='secondary' />}>
          Close
        </DialogPrimitive.Close>
      ) : null}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn(dialogTitleClasses, className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn(dialogDescriptionClasses, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogDescriptionClasses,
  dialogOverlayClasses,
  dialogTitleClasses,
  dialogVariants,
};
