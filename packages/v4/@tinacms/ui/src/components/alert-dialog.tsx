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
  footSheetFooterClasses,
  footSheetHeaderClasses,
  useFootSheetPopup,
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
      data-slot='alert-dialog-overlay'
      className={cn(dialogOverlayClasses, className)}
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
  const { popup, scrim, chrome } = useFootSheetPopup({
    on: useTier() === 'phone',
    Close: AlertDialogPrimitive.Close,
    slot: 'alert-dialog-content',
    look: cn(dialogVariants({ size: 'sm' }), 'group/dialog'),
    className,
    initialFocus,
    style,
  });
  return (
    <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal'>
      <AlertDialogOverlay {...scrim} />
      <AlertDialogPrimitive.Popup {...popup} {...props}>
        {children}
        {chrome}
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
      className={cn(
        'flex flex-col gap-1 max-md:pr-8',
        footSheetHeaderClasses,
        className
      )}
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
