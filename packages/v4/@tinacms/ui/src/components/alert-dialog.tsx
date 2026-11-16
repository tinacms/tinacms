import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import type * as React from 'react';
import { createContext, use, useImperativeHandle, useRef } from 'react';

import {
  dialogDescriptionClasses,
  dialogFooterClasses,
  dialogOverlayClasses,
  dialogTitleClasses,
  dialogVariants,
} from '@tinacms/ui/lib/dialog-styles';
import {
  FootSheetCloseButton,
  FootSheetHandle,
  firstBodyFocus,
  footSheetClasses,
  footSheetFooterClasses,
  footSheetScrimClasses,
  useFootSheetRide,
} from '@tinacms/ui/components/foot-sheet';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { cn } from '@tinacms/ui/lib/utils';

/** Lets the scrim close the confirm on a phone: Base UI's alert dialog ignores outside presses. */
const AlertDialogActionsContext = createContext<
  React.RefObject<AlertDialogPrimitive.Root.Actions | null>
>({ current: null });

function AlertDialog({
  actionsRef,
  ...props
}: AlertDialogPrimitive.Root.Props) {
  const own = useRef<AlertDialogPrimitive.Root.Actions | null>(null);
  useImperativeHandle(
    actionsRef,
    () => ({
      close: () => own.current?.close(),
      unmount: () => own.current?.unmount(),
    }),
    []
  );
  return (
    <AlertDialogActionsContext value={own}>
      <AlertDialogPrimitive.Root
        data-slot='alert-dialog'
        actionsRef={own}
        {...props}
      />
    </AlertDialogActionsContext>
  );
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot='alert-dialog-trigger' {...props} />
  );
}

function AlertDialogClose({ ...props }: AlertDialogPrimitive.Close.Props) {
  return (
    <AlertDialogPrimitive.Close data-slot='alert-dialog-close' {...props} />
  );
}

function AlertDialogOverlay({
  className,
  onClick,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) {
  const phone = useTier() === 'phone';
  const actions = use(AlertDialogActionsContext);
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot={phone ? 'foot-sheet-scrim' : 'alert-dialog-overlay'}
      className={cn(dialogOverlayClasses, footSheetScrimClasses, className)}
      onClick={(event) => {
        onClick?.(event);
        if (phone) actions.current?.close();
      }}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  initialFocus,
  style,
  ...props
}: AlertDialogPrimitive.Popup.Props) {
  const phone = useTier() === 'phone';
  const popup = useRef<HTMLDivElement>(null);
  const ride = useFootSheetRide(phone);
  return (
    <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal'>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        ref={popup}
        data-slot={phone ? 'foot-sheet' : 'alert-dialog-content'}
        className={cn(
          phone
            ? footSheetClasses
            : cn(dialogVariants({ size: 'sm' }), 'group/dialog'),
          className
        )}
        initialFocus={
          initialFocus ?? (phone ? firstBodyFocus(popup) : undefined)
        }
        style={{ ...style, ...ride }}
        {...props}
      >
        {children}
        {phone ? (
          <>
            <FootSheetCloseButton Close={AlertDialogPrimitive.Close} />
            <FootSheetHandle
              close={(handle) => (
                <AlertDialogPrimitive.Close
                  {...handle}
                  data-slot='foot-sheet-handle'
                />
              )}
            />
          </>
        ) : null}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-header'
      className={cn('flex flex-col gap-1 max-md:pr-8', className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-footer'
      className={cn(
        dialogFooterClasses,
        footSheetFooterClasses,
        'max-md:mt-auto',
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot='alert-dialog-title'
      className={cn(dialogTitleClasses, className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot='alert-dialog-description'
      className={cn(dialogDescriptionClasses, className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
};
