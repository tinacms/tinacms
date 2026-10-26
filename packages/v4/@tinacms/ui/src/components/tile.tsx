import type { ComponentProps } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { Card } from '@tinacms/ui/components/card';
import { cn } from '@tinacms/ui/lib/utils';

const NAME =
  'm-0 max-w-full min-w-0 font-sans text-base leading-title font-semibold text-pretty text-foreground';

type TileProps = Omit<ComponentProps<'div'>, 'children' | 'title'> & {
  /** The collection or global it opens. */
  title: string;
  /** What a press anywhere on the tile does. Without it the title is plain text. */
  onOpen?: () => void;
  /** The count, such as "148 documents", or the file path with `metaMono`. */
  meta?: string;
  /** The meta line in the code font, for a file path. */
  metaMono?: boolean;
  /** Shows the amber tag with these words, such as "Unsaved", in the top right corner. */
  unsaved?: string;
  /** The words of one small button, such as "New". */
  actionLabel?: string;
  /** The button's name for screen readers. Defaults to "New in Docs". */
  actionAria?: string;
  /** What the button does. Defaults to `onOpen`. */
  onAction?: () => void;
};

/**
 * One collection or global on the Home screen. The title is the one stop and opens it; the action
 * is a second stop. A tile is a way in: at most one action, and more belong on the screen it opens.
 * The Unsaved tag takes no height, so the tile looks the same with or without it.
 */
function Tile({
  title,
  onOpen,
  meta,
  metaMono = false,
  unsaved,
  actionLabel,
  actionAria,
  onAction,
  className,
  ...props
}: TileProps) {
  return (
    <Card
      data-slot='tile'
      className={cn(
        'relative box-border min-h-24 justify-between gap-3 px-4 py-3.5 font-sans text-base leading-control transition-[border-color,box-shadow]',
        'hover:border-input hover:shadow-xs',
        'has-[[data-slot=tile-name]:focus-visible]:border-ring has-[[data-slot=tile-name]:focus-visible]:shadow-focus-ring',
        className
      )}
      {...props}
    >
      <div className='flex min-w-0 items-start justify-between gap-2'>
        {onOpen ? (
          <button
            type='button'
            data-slot='tile-name'
            onClick={onOpen}
            className={cn(
              NAME,
              "cursor-pointer rounded-xs border-0 bg-transparent p-0 text-left decoration-slate-300 underline-offset-3 outline-none after:absolute after:inset-0 after:rounded-md after:content-[''] hover:underline"
            )}
          >
            {title}
          </button>
        ) : (
          <span className={NAME}>{title}</span>
        )}
        {unsaved ? (
          <Badge kind='unsaved' className='-my-0.5 flex-none'>
            {unsaved}
          </Badge>
        ) : null}
      </div>
      <div className='flex min-w-0 items-end justify-between gap-2'>
        <span
          className={cn(
            'max-w-full min-w-0 truncate text-sm text-muted-foreground',
            metaMono && 'font-mono text-xs tracking-code'
          )}
        >
          {meta}
        </span>
        {actionLabel ? (
          <Button
            size='sm'
            icon='plus'
            className='relative ml-auto'
            aria-label={actionAria ?? `${actionLabel} in ${title}`}
            onClick={onAction ?? onOpen}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export type { TileProps };
export { Tile };
