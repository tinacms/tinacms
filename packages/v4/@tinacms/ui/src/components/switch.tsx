import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import type { ReactNode } from 'react';

import { cn } from '@tinacms/ui/lib/utils';

type SwitchProps = Omit<SwitchPrimitive.Root.Props, 'children'> & {
  /** The words beside the switch. A click on them flips it too. */
  children?: ReactNode;
};

/**
 * On or off, applied at once: for settings and controls. A boolean field in a
 * document is a Checkbox. Without words, give it `aria-label` or `aria-labelledby`.
 */
function Switch({ className, children, disabled, ...props }: SwitchProps) {
  return (
    <label
      data-slot='switch-label'
      className={cn(
        'group/switch inline-flex min-h-8 cursor-pointer items-center gap-2 font-sans text-base leading-5 text-foreground select-none',
        disabled ? 'cursor-not-allowed opacity-45' : null
      )}
    >
      <SwitchPrimitive.Root
        data-slot='switch'
        disabled={disabled}
        className={cn(
          'relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full border-0 bg-slate-300 px-0.5 transition-colors outline-none group-hover/switch:bg-input-hover',
          'data-checked:bg-primary data-checked:group-hover/switch:bg-primary-hover',
          'focus:shadow-focus-ring',
          'data-disabled:group-hover/switch:bg-slate-300 data-disabled:data-checked:group-hover/switch:bg-primary',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          data-slot='switch-thumb'
          className='pointer-events-none block size-3.5 rounded-full bg-card shadow-xs transition-transform data-checked:translate-x-3.5'
        />
      </SwitchPrimitive.Root>
      {children !== undefined && children !== null && children !== '' ? (
        <span>{children}</span>
      ) : null}
    </label>
  );
}

export type { SwitchProps };
export { Switch };
