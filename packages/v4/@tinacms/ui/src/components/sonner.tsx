'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Where toasts appear. Mount one near the root of the app, then show toasts
 * with `toast()` from `@tinacms/ui/components/toast`. Sonner keeps the stack,
 * the timers and the pause on hover.
 */
function Toaster({ position = 'bottom-center', ...props }: ToasterProps) {
  return (
    <Sonner
      theme='light'
      position={position}
      className='toaster group'
      {...props}
    />
  );
}

export { Toaster };
