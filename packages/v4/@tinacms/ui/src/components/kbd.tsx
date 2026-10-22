import { cva } from 'class-variance-authority';
import { type ComponentProps, Fragment } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

const kbdVariants = cva(
  'box-border inline-flex items-center justify-center rounded-xs border border-border bg-card font-sans font-medium text-inherit shadow-key select-none',
  {
    variants: {
      size: {
        md: 'h-5.5 min-w-5.5 px-1.5 text-xs',
        sm: 'h-4.5 min-w-4.5 px-1 text-2xs',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

type KbdProps = ComponentProps<'kbd'> & { size?: 'sm' | 'md' };

/** One keycap, such as `⌘` or `K`. */
function Kbd({ size = 'md', className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot='kbd'
      className={cn(kbdVariants({ size }), className)}
      {...props}
    />
  );
}

const KEY_NAMES: Record<string, string> = {
  '⌘': 'Command',
  '⌥': 'Option',
  '⇧': 'Shift',
  '⌃': 'Control',
  '↵': 'Enter',
  '⎋': 'Escape',
  '⌫': 'Delete',
};

const ARIA_KEY_NAMES: Record<string, string> = {
  '⌘': 'Meta',
  '⌥': 'Alt',
  '⇧': 'Shift',
  '⌃': 'Control',
  '↵': 'Enter',
};

const pressesOf = (keys: string) => keys.trim().split(/\s+/).filter(Boolean);

const spoken = (presses: string[]) =>
  presses
    .map((press) => [...press].map((c) => KEY_NAMES[c] ?? c).join(' '))
    .join(', then ');

/**
 * The `aria-keyshortcuts` value for a single press, such as `⌘K` → `Meta+K`.
 * Returns `undefined` for a sequence such as `G H`, which the attribute cannot express.
 */
function keyShortcuts(keys: string) {
  const presses = pressesOf(keys);
  if (presses.length !== 1) return undefined;
  return [...presses[0]]
    .map((c) => ARIA_KEY_NAMES[c] ?? c.toUpperCase())
    .join('+');
}

type KbdShortcutProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Each press is one string, such as `⌘K`; separate a sequence with spaces: `G H`. */
  keys: string;
  size?: 'sm' | 'md';
  /** What the shortcut does. Set it when the shortcut stands alone; screen readers hear "label: Command K". */
  label?: string;
  /** Pushes the shortcut to the end of its row. */
  end?: boolean;
};

/** A keyboard shortcut drawn as keycaps, with "then" between the presses of a sequence. */
function KbdShortcut({
  keys,
  size = 'md',
  label,
  end = false,
  className,
  ...props
}: KbdShortcutProps) {
  const presses = pressesOf(keys);
  return (
    <span
      data-slot='kbd-shortcut'
      role={label ? 'img' : undefined}
      aria-label={label ? `${label}: ${spoken(presses)}` : undefined}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-flex flex-none items-center gap-1 font-sans text-xs leading-none whitespace-nowrap text-muted-foreground-strong',
        end && 'ml-auto',
        className
      )}
      {...props}
    >
      {presses.map((press, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className='text-2xs text-muted-foreground'>then</span>
          ) : null}
          <Kbd size={size}>{press}</Kbd>
        </Fragment>
      ))}
    </span>
  );
}

export type { KbdProps, KbdShortcutProps };
export { Kbd, KbdShortcut, keyShortcuts };
