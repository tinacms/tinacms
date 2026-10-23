'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Where toasts appear. Mount one near the root of the app, then show toasts
 * with `toast()` from `@tinacms/ui/components/toast`. Sonner keeps the stack,
 * the timers and the pause on hover. Toasts stack 8px apart, newest at the
 * bottom, rather than collapse behind each other.
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
      toastOptions={{ className: 'w-(--width)', ...toastOptions }}
      {...props}
    />
  );
}

export { Toaster };
