import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// `text-label` is a font size from globals.css. Without this entry, tailwind-merge
// reads it as a text colour and drops it, or the real colour, when both appear.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: ['label'] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
