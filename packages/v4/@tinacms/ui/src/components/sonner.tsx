'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { cn } from '@tinacms/ui/lib/utils';

/**
 * Where toasts appear. Mount one near the root of the app, then show toasts
 * with `toast()` from `@tinacms/ui/components/toast`. Sonner keeps the stack,
 * the timers and the pause on hover.
 */
function Toaster({
  position = 'bottom-center',
  toastOptions,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      theme='light'
      position={position}
      className='toaster group'
      expand
      gap={8}
      toastOptions={{
        ...toastOptions,
        className: cn('w-(--width)', toastOptions?.className),
      }}
      {...props}
    />
  );
}

export { Toaster };
