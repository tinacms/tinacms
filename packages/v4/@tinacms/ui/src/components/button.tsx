import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge, type CountTone } from '@tinacms/ui/components/badge';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { KbdShortcut, keyShortcuts } from '@tinacms/ui/components/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { cn } from '@tinacms/ui/lib/utils';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'icon';
type ButtonSize = 'md' | 'sm';

/** One height per size, shared by every variant so mixed buttons line up. */
const buttonHeight = { md: 'h-9', sm: 'h-8' } as const satisfies Record<
  ButtonSize,
  string
>;

/**
 * Hover and press styles are written `not-disabled:not-aria-disabled:` so a disabled or busy button never
 * shows them; the plain `hover:` of each variant restates its resting fill.
 */
const buttonVariants = cva(
  'group/button relative box-border inline-flex transition-all min-w-0 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border-0 font-sans leading-control font-medium whitespace-nowrap no-underline outline-none select-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-button-primary hover:bg-primary not-disabled:not-aria-disabled:hover:bg-primary-hover not-disabled:not-aria-disabled:active:bg-primary-active',
        outline:
          'bg-card text-foreground shadow-xs inset-ring inset-ring-border hover:bg-card not-disabled:not-aria-disabled:hover:bg-muted',
        ghost:
          'bg-transparent text-foreground hover:bg-transparent not-disabled:not-aria-disabled:hover:bg-muted',
        destructive:
          'bg-card text-destructive shadow-xs inset-ring inset-ring-status-failed-border hover:bg-card not-disabled:not-aria-disabled:hover:bg-status-failed-subtle not-disabled:not-aria-disabled:hover:inset-ring-destructive',
        icon: 'gap-0 bg-transparent px-0 text-muted-foreground hover:bg-transparent not-disabled:not-aria-disabled:hover:bg-muted not-disabled:not-aria-disabled:hover:text-foreground',
      },
      size: {
        md: `${buttonHeight.md} px-3.75 text-base`,
        sm: `${buttonHeight.sm} px-2.75 text-sm`,
      },
      selected: { true: '', false: '' },
      redIcon: { true: '', false: '' },
      full: { true: 'w-full', false: '' },
      shortcut: { true: '', false: '' },
      busy: { true: 'cursor-progress', false: '' },
    },
    compoundVariants: [
      { variant: 'icon', size: 'md', className: 'w-9 px-0' },
      { variant: 'icon', size: 'sm', className: 'w-8 px-0' },
      {
        variant: 'icon',
        redIcon: true,
        className:
          'text-destructive not-disabled:not-aria-disabled:hover:bg-status-failed-subtle not-disabled:not-aria-disabled:hover:text-destructive',
      },
      {
        variant: 'outline',
        selected: true,
        className:
          'bg-pressed shadow-none inset-ring-0 hover:bg-pressed not-disabled:not-aria-disabled:hover:bg-pressed not-disabled:not-aria-disabled:active:bg-pressed',
      },
      {
        variant: 'icon',
        selected: true,
        className:
          'bg-selected text-foreground hover:bg-selected not-disabled:not-aria-disabled:hover:bg-selected not-disabled:not-aria-disabled:hover:text-foreground',
      },
      { shortcut: true, size: 'md', className: 'pr-1.25' },
      { shortcut: true, size: 'sm', className: 'pr-1' },
    ],
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      selected: false,
      redIcon: false,
      full: false,
      shortcut: false,
      busy: false,
    },
  }
);

type ButtonBaseProps = Omit<ButtonPrimitive.Props, 'children'> & {
  size?: ButtonSize;
  full?: boolean;
  /**
   * The button's own work is running: a spinner replaces the leading icon, presses do nothing and it
   * stays in the Tab order. `disabled` wins over `busy`.
   */
  busy?: boolean;
};

type CountOnWords =
  | { count?: undefined; countTone?: never; srLabel?: never }
  | {
      /** A red count of errors after the words, shown from 1. */
      count: number;
      /** Red `error` by default. */
      countTone?: CountTone;
      /** The words screen readers hear, such as ", 3 errors". */
      srLabel: string;
    };

type WithWords = ButtonBaseProps & {
  children?: ReactNode;
  /** An icon after the words. `chevron-down` stays small, for a button that opens a menu. */
  iconEnd?: Glyph | LucideIcon;
  /** The words in the code font, such as a branch name. */
  mono?: boolean;
  /** Keyboard keys after the words, such as `⌘K`. */
  shortcut?: string;
} & CountOnWords;

type IconOnly = ButtonBaseProps & {
  variant: 'icon';
  /** The button's name, shown in its tooltip and heard by screen readers. Or give `aria-label`. */
  children?: string;
  /** Keyboard keys shown after the name in the tooltip, such as `⌘K`. */
  shortcut?: string;
};

type ButtonProps =
  | (WithWords & {
      /** The one main action in a view or dialog; never two. */
      variant: 'primary';
      icon?: Glyph | LucideIcon;
    })
  | (WithWords & {
      /** Default. Toolbars and bars, and a neutral action beside a primary. */
      variant?: 'outline';
      icon?: Glyph | LucideIcon;
      /** The pressed look, for the view that is on. Pair it with `aria-pressed` or `aria-current`. */
      selected?: boolean;
    })
  | (WithWords & {
      /** Low emphasis, such as Cancel, Back or a menu trigger. */
      variant: 'ghost';
      icon?: Glyph | LucideIcon;
    })
  | (WithWords & {
      /** Removes, deletes or discards. It always shows the bin, so it takes no `icon`. */
      variant: 'destructive';
    })
  | (IconOnly & {
      icon?: Glyph | LucideIcon;
      destructive?: false;
      /** The selected look, for the view that is open. Pair it with `aria-pressed` or `aria-current`. */
      selected?: boolean;
      /** An amber count in the top right corner, shown from 1. Put the number in the name too. */
      count?: number;
      countTone?: CountTone;
    })
  | (IconOnly & {
      /** A remove with no room for words: the red bin alone. Name it for what it removes. */
      destructive: true;
    });

/** Every prop any variant takes, so the body reads them in one place; `ButtonProps` says which apply. */
type AnyButtonProps = ButtonBaseProps & {
  variant?: ButtonVariant;
  children?: ReactNode;
  icon?: Glyph | LucideIcon;
  iconEnd?: Glyph | LucideIcon;
  selected?: boolean;
  destructive?: boolean;
  mono?: boolean;
  shortcut?: string;
  count?: number;
  countTone?: CountTone;
  srLabel?: string;
};

/**
 * Every button in the admin, in five variants and two sizes. Keyboard focus draws the orange ring with a
 * soft glow; a click draws nothing. An icon button needs a name (its string children or `aria-label`),
 * shown in a tooltip with its `shortcut` on hover and keyboard focus, and not while disabled.
 * For a link, style an `<a>` with `buttonVariants({ variant })`.
 */
function Button(buttonProps: ButtonProps) {
  const all: AnyButtonProps = buttonProps;
  const {
    variant = 'outline',
    size = 'md',
    children,
    icon: iconProp,
    iconEnd,
    selected = false,
    full = false,
    busy = false,
    destructive = false,
    mono = false,
    shortcut,
    count,
    countTone,
    srLabel,
    className,
    type,
    disabled,
    ...props
  } = all;
  const iconOnly = variant === 'icon';
  const redIcon = iconOnly && destructive;
  const textName =
    iconOnly && typeof children === 'string' && children !== ''
      ? children
      : undefined;
  const name = props['aria-label'] ?? textName;
  const label = textName === undefined ? children : undefined;
  const endIcon = iconOnly ? undefined : iconEnd;
  const keys = shortcut || undefined;
  const glyph = busy
    ? 'spinner'
    : variant === 'destructive' || redIcon
      ? 'trash'
      : iconProp;
  const iconSize = iconOnly && size === 'md' ? 20 : 16;
  const endIconSize = endIcon === 'chevron-down' ? 14 : 16;

  const button = (
    <ButtonPrimitive
      data-slot='button'
      type={type ?? 'button'}
      aria-keyshortcuts={keys ? keyShortcuts(keys) : undefined}
      {...props}
      disabled={disabled || busy}
      focusableWhenDisabled={busy ? !disabled : props.focusableWhenDisabled}
      aria-label={name}
      className={cn(
        buttonVariants({
          variant,
          size,
          selected: (variant === 'outline' || iconOnly) && selected,
          redIcon,
          full,
          shortcut: Boolean(keys) && !iconOnly,
          busy,
        }),
        className
      )}
    >
      {glyph ? (
        <span
          className={cn(
            'inline-flex',
            iconOnly && selected && !redIcon && 'text-primary'
          )}
        >
          <Icon glyph={glyph} size={iconSize} />
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
      {keys && !iconOnly ? <KbdShortcut keys={keys} end /> : null}
      {endIcon ? <Icon glyph={endIcon} size={endIconSize} /> : null}
      {iconOnly && count ? (
        <Badge kind='count' tone={countTone ?? 'change'} count={count} corner />
      ) : null}
      {!iconOnly && count && srLabel !== undefined ? (
        <Badge
          kind='count'
          tone={countTone ?? 'error'}
          count={count}
          srLabel={srLabel}
        />
      ) : null}
    </ButtonPrimitive>
  );

  if (!iconOnly || !name || disabled) return button;

  const expanded =
    props['aria-expanded'] === true || props['aria-expanded'] === 'true';
  return (
    <Tooltip disabled={expanded}>
      <TooltipTrigger render={button} />
      <TooltipContent>
        {name}
        {keys ? <KbdShortcut keys={keys} size='sm' /> : null}
      </TooltipContent>
    </Tooltip>
  );
}

export type { ButtonBaseProps, ButtonProps, ButtonSize, ButtonVariant };
export { Button, buttonHeight, buttonVariants };
