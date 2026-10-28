import { cva } from 'class-variance-authority';

/**
 * The field box shared by Input and Textarea. `data-readonly` marks read-only,
 * because `:read-only` also matches a disabled field.
 */
export const fieldVariants = cva(
  [
    'box-border w-full min-w-0 rounded-sm border border-input bg-card px-2.5 font-sans text-base text-foreground shadow-none transition-[border-color,box-shadow] outline-none',
    'placeholder:text-muted-foreground hover:border-input-hover',
    'focus:border-ring focus:shadow-focus-field',
    'aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus:border-destructive',
    'disabled:cursor-not-allowed disabled:border-border disabled:opacity-60',
    'data-readonly:border-border-subtle data-readonly:bg-muted data-readonly:hover:border-border-subtle data-readonly:focus:border-border-subtle data-readonly:focus:shadow-none',
  ],
  {
    variants: {
      kind: {
        input: 'h-8 py-0',
        textarea:
          'field-sizing-fixed h-24 max-h-120 min-h-14 resize-y py-2 leading-5 disabled:resize-none data-readonly:resize-none',
      },
      mono: { true: 'font-mono tracking-code', false: '' },
    },
    defaultVariants: { kind: 'input', mono: false },
  }
);

/** The list and option looks of Select and Combobox. */
export const selectListClassName =
  'w-auto min-w-(--anchor-width) rounded-md bg-popover p-1 font-sans text-base text-foreground shadow-popover';

export const selectOptionClassName =
  "relative flex min-h-8 w-full cursor-default items-center gap-3 rounded-sm py-1.5 pr-8 pl-2 text-base leading-5 text-foreground outline-hidden select-none focus:bg-muted data-highlighted:bg-muted data-selected:font-medium data-disabled:cursor-not-allowed data-disabled:text-muted-foreground data-disabled:focus:bg-transparent data-disabled:data-highlighted:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
