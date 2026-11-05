import type { ComponentProps, ReactNode } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type StatusBarState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'failed';

const STATE_GLYPH: Record<StatusBarState, Glyph | undefined> = {
  idle: undefined,
  unsaved: undefined,
  saving: 'spinner',
  saved: 'check',
  failed: 'error',
};

type StatusBarWhere =
  /** Files on this computer. Shows "Local files" with a folder icon. */
  | { local: true; branch?: never; protectedBranch?: never }
  | {
      local?: false;
      /** Leave it out when the provider has no branches: the bar then omits the location. */
      branch?: string;
      protectedBranch?: boolean;
    };

type StatusBarProps = Omit<ComponentProps<'footer'>, 'children'> &
  StatusBarWhere & {
    /** Draws the icon, or the unsaved dot, before the words. `failed` turns them red. */
    state?: StatusBarState;
    /** The state in words. Screen readers hear each change. */
    children?: ReactNode;
  };

/**
 * The 28px bar along the bottom of the admin: where edits save to, then the save
 * state. A failed save says so in words, so colour is not the only signal.
 */
function StatusBar({
  local,
  branch,
  protectedBranch = false,
  state,
  children,
  className,
  ...props
}: StatusBarProps) {
  const glyph = state ? STATE_GLYPH[state] : undefined;
  const failed = state === 'failed';
  return (
    <footer
      aria-label='Status bar'
      data-slot='status-bar'
      className={cn(
        'box-border flex h-7 min-w-0 flex-none items-center gap-4 border-t border-border-subtle bg-card px-3 font-sans text-xs leading-none text-muted-foreground-strong',
        className
      )}
      {...props}
    >
      {local || branch ? (
        <span className='inline-flex flex-none items-center gap-1.5 font-mono tracking-code'>
          <Icon glyph={local ? 'folder' : 'branch'} size={14} />
          {local
            ? 'Local files'
            : protectedBranch
              ? `${branch} (protected)`
              : branch}
        </span>
      ) : null}
      <span
        data-slot='status-bar-state'
        className='inline-flex min-w-0 items-center gap-1.5'
      >
        {glyph ? (
          <Icon
            glyph={glyph}
            size={14}
            className={cn(
              glyph === 'spinner' && 'motion-safe:animate-spin',
              failed && 'text-destructive'
            )}
          />
        ) : null}
        {state === 'unsaved' ? <Badge kind='dot' /> : null}
        <span
          aria-live='polite'
          className={cn(
            'min-w-0 truncate',
            failed && 'font-medium text-destructive'
          )}
        >
          {children}
        </span>
      </span>
    </footer>
  );
}

export type { StatusBarState, StatusBarProps };
export { StatusBar };
