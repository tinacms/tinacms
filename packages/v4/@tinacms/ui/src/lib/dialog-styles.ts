import { cva } from 'class-variance-authority';

export const dialogOverlayClasses =
  'fixed inset-0 isolate z-50 bg-scrim transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0';

/** The card of Dialog and AlertDialog. */
export const dialogVariants = cva(
  [
    'fixed inset-4 z-50 m-auto flex h-fit max-h-full w-auto flex-col gap-4 overflow-y-auto rounded-lg bg-popover p-6 font-sans text-base leading-control text-foreground shadow-dialog outline-none',
    'transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
  ],
  {
    variants: { size: { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl' } },
    defaultVariants: { size: 'md' },
  }
);

/** The title of Dialog, AlertDialog and Sheet. */
export const dialogTitleClasses =
  'font-sans text-md leading-title font-semibold text-foreground';

export const dialogDescriptionClasses =
  'text-base text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground';
