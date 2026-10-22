import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { KbdShortcut, keyShortcuts } from '@tinacms/ui/components/kbd';
import { cn } from '@tinacms/ui/lib/utils';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'toolbar'
  | 'ghost'
  | 'inverse'
  | 'icon'
  | 'icon-inverse'
  | 'destructive';
type ButtonSize = 'md' | 'sm';

const buttonVariants = cva(
  "group/button relative box-border inline-flex transition-all h-9 min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border-0 px-3.75 font-sans text-base leading-control font-medium whitespace-nowrap no-underline outline-none select-none focus:shadow-focus-ring disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-button-primary hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-secondary text-foreground hover:bg-secondary-hover',
        toolbar:
          'bg-card text-foreground shadow-xs inset-ring inset-ring-border hover:bg-muted',
        ghost: 'max-w-55 gap-1 bg-transparent text-foreground hover:bg-muted',
        inverse:
          'bg-transparent text-white inset-ring inset-ring-inv-line hover:bg-inv-hover',
        icon: 'w-9 gap-0 bg-transparent px-0 text-slate-600 hover:bg-muted hover:text-foreground',
        'icon-inverse':
          'w-9 gap-0 bg-transparent px-0 text-inv-muted hover:bg-inv-hover hover:text-white',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80',
      },
      size: { md: '', sm: '' },
      selected: { true: '', false: '' },
      full: { true: 'w-full', false: '' },
      bothIcons: { true: '', false: '' },
      shortcut: { true: '', false: '' },
    },
    compoundVariants: [
      { size: 'sm', className: 'h-8 px-2.75 text-sm' },
      { variant: ['toolbar', 'ghost'], className: 'h-8 text-sm' },
      { variant: 'toolbar', className: 'px-2.75' },
      { variant: 'ghost', className: 'pr-2.25 pl-1.25' },
      { variant: 'ghost', bothIcons: true, className: 'px-1.75' },
      { variant: ['icon', 'icon-inverse'], size: 'sm', className: 'w-8 px-0' },
      {
        variant: ['primary', 'secondary', 'toolbar', 'ghost', 'inverse'],
        selected: true,
        className:
          'bg-slate-200 text-foreground shadow-none inset-ring-0 hover:bg-slate-200 active:bg-slate-200',
      },
      {
        variant: 'icon',
        selected: true,
        className: 'bg-selected text-foreground hover:bg-selected',
      },
      { shortcut: true, className: 'pr-1.25' },
    ],
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      selected: false,
      full: false,
      bothIcons: false,
      shortcut: false,
    },
  }
);

const ICON_SIZE = { 12: 'size-3', 16: 'size-4', 19: 'size-4.75' } as const;
type IconPixels = keyof typeof ICON_SIZE;

type ButtonProps = Omit<ButtonPrimitive.Props, 'children'> & {
  /** `primary` (one per screen), `secondary`, `toolbar`, `ghost`, `inverse` (on a dark bar), `icon`, `icon-inverse` or `destructive`. */
  variant?: ButtonVariant;
  /** `md` is 36px high, `sm` is 32px. Toolbar and ghost buttons are always 32px. */
  size?: ButtonSize;
  /** The words. On an icon button, words become its accessible name; an element such as an svg renders as is. */
  children?: ReactNode;
  /** An icon before the words: a named glyph or any lucide icon. */
  icon?: Glyph | LucideIcon;
  /** An icon after the words. `chevron-down` stays small, for a button that opens a menu. Not on icon buttons. */
  iconEnd?: Glyph | LucideIcon;
  /** The look for the screen or panel that is open. Pair it with `aria-pressed` or `aria-current`. */
  selected?: boolean;
  full?: boolean;
  /** The amber dot before the words, for a button that leads to unsaved work. Not on icon buttons. */
  dot?: boolean;
  /** The words in the code font, such as a branch name. */
  mono?: boolean;
  /** Keyboard keys after the words, such as `⌘K`. Not on icon buttons. */
  shortcut?: string;
  /** The amber count in the corner of an icon button, shown from 1. Put the number in the button's name too. */
  count?: number;
};

/**
 * Every button in the admin. Base UI handles the keyboard; focus, by click or by keyboard,
 * draws the orange ring with a soft glow. An icon button needs a name: string `children` or `aria-label`.
 * For a link, style an `<a>` with `buttonVariants({ variant })`; this component is always a button.
 */
function Button({
  variant = 'secondary',
  size = 'md',
  children,
  icon,
  iconEnd,
  selected = false,
  full = false,
  dot = false,
  mono = false,
  shortcut,
  count,
  className,
  type,
  ...props
}: ButtonProps) {
  const iconOnly = variant === 'icon' || variant === 'icon-inverse';
  const textName =
    iconOnly && typeof children === 'string' && children !== ''
      ? children
      : undefined;
  const label = textName === undefined ? children : undefined;
  const endIcon = iconOnly ? undefined : iconEnd;
  const keys = iconOnly ? undefined : shortcut || undefined;
  const iconSize: IconPixels = iconOnly && size === 'md' ? 19 : 16;
  const endIconSize: IconPixels = endIcon === 'chevron-down' ? 12 : 16;

  return (
    <ButtonPrimitive
      data-slot='button'
      type={type ?? 'button'}
      aria-keyshortcuts={keys ? keyShortcuts(keys) : undefined}
      {...props}
      aria-label={props['aria-label'] ?? textName}
      className={cn(
        buttonVariants({
          variant,
          size,
          selected,
          full,
          bothIcons: Boolean(icon && endIcon),
          shortcut: Boolean(keys),
        }),
        className
      )}
    >
      {dot && !iconOnly ? <Badge kind='dot' /> : null}
      {icon ? (
        <span
          className={cn(
            'inline-flex',
            variant === 'ghost' &&
              'text-slate-600 group-hover/button:text-foreground',
            variant === 'icon' && selected && 'text-primary'
          )}
        >
          <Icon glyph={icon} size={iconSize} className={ICON_SIZE[iconSize]} />
        </span>
      ) : null}
      {typeof label === 'string' && label !== '' ? (
        <span
          className={cn(
            'min-w-0 truncate',
            mono && 'font-mono text-xs tracking-code'
          )}
        >
          {label}
        </span>
      ) : (
        label
      )}
      {keys ? <KbdShortcut keys={keys} end /> : null}
      {endIcon ? (
        <Icon
          glyph={endIcon}
          size={endIconSize}
          className={ICON_SIZE[endIconSize]}
        />
      ) : null}
      {iconOnly && count !== undefined && count > 0 ? (
        <Badge kind='count' count={count} corner />
      ) : null}
    </ButtonPrimitive>
  );
}

export type { ButtonProps, ButtonSize, ButtonVariant };
export { Button, buttonVariants };
