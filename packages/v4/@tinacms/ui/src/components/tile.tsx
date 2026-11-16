import type { ComponentProps } from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { Card } from '@tinacms/ui/components/card';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { useLoadingWords } from '@tinacms/ui/hooks/use-loading-words';
import { cn } from '@tinacms/ui/lib/utils';

const NAME =
  'm-0 max-w-full min-w-0 wrap-anywhere font-sans text-base leading-title font-semibold text-pretty text-foreground';

type TileProps = Omit<ComponentProps<'div'>, 'children' | 'title'> & {
  /** The collection or global it opens. */
  title: string;
  /** What a press anywhere on the tile does. Without it the title is plain text. */
  onOpen?: () => void;
  /** The count, such as "148 documents", or the file path with `metaMono`. */
  meta?: string;
  /** The meta line in the code font, for a file path. A path wraps; it is never cut off. */
  metaMono?: boolean;
  /** A grey placeholder in place of `meta` while it loads. */
  metaLoading?: boolean;
  /** Shows the amber tag with these words, such as "Unsaved", in the top right corner. */
  unsaved?: string;
  /** The words of one small button, such as "New". */
  actionLabel?: string;
  /** The button's name for screen readers. Defaults to "New in Docs". */
  actionAria?: string;
  /** What the button does. Defaults to `onOpen`. */
  onAction?: () => void;
  /** The button shows but can't be pressed yet. A disabled button is not a Tab stop. */
  actionDisabled?: boolean;
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
  metaLoading = false,
  unsaved,
  actionLabel,
  actionAria,
  onAction,
  actionDisabled = false,
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
        {metaLoading ? (
          <Skeleton className='w-20' />
        ) : (
          <span
            className={cn(
              'max-w-full min-w-0 text-sm text-muted-foreground',
              metaMono
                ? 'font-mono text-xs tracking-code wrap-anywhere'
                : 'truncate'
            )}
          >
            {meta}
          </span>
        )}
        {actionLabel ? (
          <Button
            size='sm'
            icon='plus'
            className='relative ml-auto'
            aria-label={actionAria ?? `${actionLabel} in ${title}`}
            disabled={actionDisabled}
            onClick={onAction ?? onOpen}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

type TileGridProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The tiles, in order. Each is its own card. */
  tiles: (TileProps & { key: string })[];
  /** The name screen readers hear for the list, such as "Collections". */
  label: string;
  /** This many grey placeholder tiles in place of `tiles` while they load. */
  loading?: number;
  /** What screen readers hear once while `loading`. "Loading" and the `label` by default. */
  loadingLabel?: string;
};

/**
 * Tiles as separate cards in one grid, straight on a Home panel's grey tray. One column, two from
 * 448px, three from 576px of the grid's own width.
 */
function TileGrid({
  tiles,
  label,
  loading = 0,
  loadingLabel,
  className,
  ...props
}: TileGridProps) {
  const said = useLoadingWords(loading > 0, loadingLabel ?? `Loading ${label}`);
  return (
    <div
      data-slot='tile-grid'
      className={cn('@container', className)}
      {...props}
    >
      <span role='status' className='sr-only'>
        {said}
      </span>
      <ul
        aria-label={label}
        aria-busy={loading > 0 || undefined}
        className='m-0 grid list-none grid-cols-1 gap-3 p-0 @md:grid-cols-2 @xl:grid-cols-3'
      >
        {loading > 0
          ? Array.from({ length: loading }, (_, index) => (
              <li
                key={index}
                aria-hidden='true'
                className='flex min-h-24 flex-col justify-between gap-3 rounded-md border border-border bg-card px-4 py-3.5 shadow-xs'
              >
                <Skeleton className='w-1/2' />
                <Skeleton className='w-1/3' />
              </li>
            ))
          : tiles.map(({ key, ...tile }) => (
              <li key={key} className='flex min-w-0'>
                <Tile
                  {...tile}
                  className={cn('w-full shadow-xs', tile.className)}
                />
              </li>
            ))}
      </ul>
    </div>
  );
}

export type { TileGridProps, TileProps };
export { Tile, TileGrid };
