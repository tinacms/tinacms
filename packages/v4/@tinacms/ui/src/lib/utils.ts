import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Without these, tailwind-merge reads `shadow-focus-field` as a shadow colour,
// so a later `shadow-none` does not replace it.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: [
        'popover',
        'toast',
        'toast-dark',
        'lifted',
        'dialog',
        'focus-ring',
        'focus-field',
        'focus-inset',
        'field-active',
        'unsaved-glow',
        'key',
        'button-primary',
        'segment',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
