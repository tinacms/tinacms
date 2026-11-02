import type { ComponentProps, ReactNode } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

type StatusBarState = 'unsaved' | 'saving' | 'saved' | 'failed';

const STATE_GLYPH: Record<StatusBarState, Glyph | undefined> = {
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
      branch: string;
      protectedBranch?: boolean;
    };

type StatusBarProps = Omit<ComponentProps<'footer'>, 'children'> &
  StatusBarWhere & {
    /** Draws the icon, or the unsaved dot, before the words. `failed` turns them red. */
    state?: StatusBarState;
    /** The state in words. Screen readers hear each change. */
    children?: ReactNode;
    /** Screen readers do not hear it with the words. */
    action?: { label: string; onClick: () => void };
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
  action,
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
      <span className='inline-flex flex-none items-center gap-1.5 font-mono tracking-code'>
        <Icon glyph={local ? 'folder' : 'branch'} size={14} />
        {local
          ? 'Local files'
          : protectedBranch
            ? `${branch} (protected)`
            : branch}
      </span>
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
        {action ? (
          <Button
            variant='outline'
            size='sm'
            onClick={action.onClick}
            className='h-5 px-1.5 text-xs'
          >
            {action.label}
          </Button>
        ) : null}
      </span>
    </footer>
  );
}

export type { StatusBarState, StatusBarProps };
export { StatusBar };
