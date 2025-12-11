'use client';

import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn, createPrimitiveElement, withCn, withRef } from '@udecode/cn';
import { X } from 'lucide-react';

export const Dialog: React.FC<DialogPrimitive.DialogProps> =
  DialogPrimitive.Root;

export const DialogTrigger: React.FC<DialogPrimitive.DialogTriggerProps> =
  DialogPrimitive.Trigger;

export const DialogPortal: React.FC<DialogPrimitive.DialogPortalProps> =
  DialogPrimitive.Portal;

export const DialogClose: React.FC<DialogPrimitive.DialogCloseProps> =
  DialogPrimitive.Close;

type DialogOverlayProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
>;

export const DialogOverlay: React.FC<DialogOverlayProps> = withCn(
  DialogPrimitive.Overlay,
  'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0'
) as React.FC<DialogOverlayProps>;

export const DialogContent: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    React.RefAttributes<React.ElementRef<typeof DialogPrimitive.Content>>
> = withRef<typeof DialogPrimitive.Content>(
  ({ children, className, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-48% data-[state=closed]:slide-out-to-top-48% fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:rounded-lg',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className='absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
          <X className='size-4' />
          <span className='sr-only'>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const DialogHeader: React.FC<DialogHeaderProps> = withCn(
  createPrimitiveElement('div'),
  'flex flex-col space-y-1.5 text-center sm:text-left'
) as React.FC<DialogHeaderProps>;

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const DialogFooter: React.FC<DialogFooterProps> = withCn(
  createPrimitiveElement('div'),
  'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'
) as React.FC<DialogFooterProps>;

type DialogTitleProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

export const DialogTitle: React.FC<DialogTitleProps> = withCn(
  DialogPrimitive.Title,
  'text-lg leading-none font-semibold tracking-tight'
) as React.FC<DialogTitleProps>;

type DialogDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

export const DialogDescription: React.FC<DialogDescriptionProps> = withCn(
  DialogPrimitive.Description,
  'text-sm text-muted-foreground'
) as React.FC<DialogDescriptionProps>;
