import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import {
  dialogDescriptionClasses,
  dialogFooterClasses,
  dialogOverlayClasses,
  dialogTitleClasses,
  dialogVariants,
} from '@tinacms/ui/lib/dialog-styles';
import { cn } from '@tinacms/ui/lib/utils';

import { Button } from '@tinacms/ui/components/button';
import {
  FootSheetRootProvider,
  footSheetFooterClasses,
  footSheetHeaderClasses,
  useFootSheetPopup,
} from '@tinacms/ui/components/foot-sheet';
import { useTier } from '@tinacms/ui/hooks/use-tier';

function Dialog({
  keepOnDismiss = false,
  onOpenChange,
  ...props
}: DialogPrimitive.Root.Props & {
  /**
   * On a phone, a tap on the scrim or the handle does not close while this is true. ×, any
   * `DialogClose`, Escape and the caller's own Cancel still do.
   */
  keepOnDismiss?: boolean;
}) {
  const phone = useTier() === 'phone';
  return (
    <FootSheetRootProvider value={{ keepOnDismiss: keepOnDismiss && phone }}>
      <DialogPrimitive.Root
        data-slot='dialog'
        onOpenChange={(open, details) => {
          if (
            !open &&
            keepOnDismiss &&
            phone &&
            details.reason === 'outside-press'
          ) {
            details.cancel();
            return;
          }
          onOpenChange?.(open, details);
        }}
        {...props}
      />
    </FootSheetRootProvider>
  );
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

function DialogContent({
  className,
  children,
  size,
  showCloseButton = true,
  keyboard = false,
  initialFocus,
  style,
  ...props
}: DialogPrimitive.Popup.Props &
  VariantProps<typeof dialogVariants> & {
    showCloseButton?: boolean;
    /** Lays the sheet out from the top on a phone, with its actions right under the body. */
    keyboard?: boolean;
  }) {
  const phone = useTier() === 'phone';
  const { popup, scrim, chrome } = useFootSheetPopup({
    on: phone,
    Close: DialogPrimitive.Close,
    slot: 'dialog-content',
    look: cn(dialogVariants({ size }), 'group/dialog'),
    className,
    initialFocus,
    style,
  });
  return (
    <DialogPortal>
      <DialogOverlay {...scrim} />
      <DialogPrimitive.Popup
        {...popup}
        data-close-button={showCloseButton || phone ? '' : undefined}
        data-keyboard={keyboard ? '' : undefined}
        {...props}
      >
        {children}
        {showCloseButton && !phone ? (
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
        {chrome}
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
        footSheetHeaderClasses,
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
        dialogFooterClasses,
        footSheetFooterClasses,
        'max-md:mt-auto max-md:group-data-keyboard/dialog:mt-0',
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close render={<Button variant='ghost' />}>
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
};
