import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

const SIZES = {
  sm: { circle: 'size-6', text: 'text-3xs' },
  md: { circle: 'size-8', text: 'text-xs' },
  lg: { circle: 'size-10', text: 'text-sm' },
} as const;

/** "Josh Berman" → "JB". */
const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

type AvatarProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** Up to two letters. Defaults to the initials of `name`. */
  initials?: string;
  /** The person's name, for the initials and the button's name. */
  name?: string;
  size?: keyof typeof SIZES;
  /** `button` opens the account menu. Defaults to `button` when `onClick` is set. */
  as?: 'button' | 'static';
  /** The name screen readers hear. A static avatar without it is decorative. */
  label?: string;
  /** With `as='button'`: whether the account menu is open. */
  expanded?: boolean;
};

/** A person's initials in a circle. As a button, it opens the account menu. */
function Avatar({
  initials,
  name,
  size = 'md',
  as,
  label,
  expanded,
  onClick,
  className,
  ...props
}: AvatarProps) {
  const isButton = as ? as === 'button' : onClick !== undefined;
  const letters = initials || initialsOf(name) || '?';
  const circle = (labelled: boolean) => (
    <AvatarPrimitive.Root
      data-slot='avatar'
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn(
        'relative box-border flex flex-none shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken',
        SIZES[size].circle,
        isButton &&
          'transition-shadow group-hover/avatar-button:ring-2 group-hover/avatar-button:ring-slate-300 group-hover/avatar-button:ring-offset-2 group-hover/avatar-button:ring-offset-card',
        !isButton && className
      )}
    >
      <AvatarPrimitive.Fallback
        className={cn(
          'flex size-full items-center justify-center rounded-full bg-slate-200 font-sans leading-none font-semibold tracking-initials text-slate-600',
          SIZES[size].text
        )}
      >
        {letters}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );

  if (!isButton) return circle(Boolean(label));

  return (
    <button
      type='button'
      aria-label={label ?? (name ? `Account, ${name}` : 'Account')}
      aria-haspopup='menu'
      aria-expanded={expanded ?? false}
      onClick={onClick}
      className={cn(
        'group/avatar-button inline-flex cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none focus:shadow-focus-ring',
        className
      )}
      {...props}
    >
      {circle(false)}
    </button>
  );
}

export type { AvatarProps };
export { Avatar };
