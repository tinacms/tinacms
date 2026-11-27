import { Button, buttonVariants } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { cn } from '@tinacms/ui/lib/utils';
import {
  CheckIcon,
  CircleAlertIcon,
  ExternalLinkIcon,
  FolderIcon,
} from 'lucide-react';
import type { MediaItem, MediaStatus } from '../../core/media/contract';
import { checkerboardStyle } from './media-grid';
import { mediaNameOf } from './media-types';
import {
  ALREADY_ADDED,
  folderNameOf,
  loadingWords,
  pickedTileLabel,
} from './media-picker-words';

export function LoadingGrid({ label }: { label: string }) {
  return (
    <div
      role='status'
      aria-label={label}
      className='grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3'
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} shape='block' className='aspect-square' />
      ))}
    </div>
  );
}

export function PickerLoading({ folder }: { folder: string }) {
  return <LoadingGrid label={loadingWords(folder)} />;
}

export function SetupBanner({
  status,
}: {
  status: Extract<MediaStatus, { kind: 'needs-setup' }>;
}) {
  return (
    <div className='flex h-full items-center justify-center p-6'>
      <div className='flex items-start gap-2 rounded-sm border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800'>
        <Icon
          glyph={CircleAlertIcon}
          size={20}
          className='mt-0.5 text-yellow-500'
        />
        <div className='flex flex-col items-start gap-2'>
          <p>{status.message}</p>
          <a
            href={status.actionUrl}
            target='_blank'
            rel='noreferrer noopener'
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            {status.actionLabel}
            <Icon glyph={ExternalLinkIcon} size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

export function PickerFolderCard({
  item,
  onOpen,
}: {
  item: MediaItem;
  onOpen: (path: string) => void;
}) {
  const name = mediaNameOf(item.path);
  return (
    <li>
      <button
        type='button'
        aria-label={`Open folder ${name}`}
        className='flex w-full flex-col overflow-hidden rounded-md border bg-card text-left shadow-sm transition outline-none hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50'
        onClick={() => onOpen(item.path)}
      >
        <span className='flex h-20 items-center justify-center'>
          <FolderIcon className='size-9 text-primary' />
        </span>
        <span
          title={name}
          className='w-full truncate border-t px-2.5 py-2 text-sm font-medium'
        >
          {name}
        </span>
      </button>
    </li>
  );
}

export function PickerImageTile({
  item,
  number,
  many,
  added,
  isNew,
  src,
  onToggle,
}: {
  item: MediaItem;
  /** The pick's place in pick order, from 1, or null while unpicked. */
  number: number | null;
  many: boolean;
  added: boolean;
  isNew: boolean;
  src: string;
  onToggle: (item: MediaItem) => void;
}) {
  const name = mediaNameOf(item.path);
  const picked = number !== null;
  const label = pickedTileLabel(name, { number, added, many });
  return (
    <li>
      <button
        type='button'
        aria-label={isNew ? `${label} (new)` : label}
        aria-pressed={added ? undefined : picked}
        aria-disabled={added ? 'true' : undefined}
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-md border bg-card text-left shadow-sm transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          picked
            ? 'border-2 border-primary shadow-md ring-2 ring-primary/20'
            : added
              ? 'cursor-not-allowed'
              : 'hover:border-primary/40 hover:shadow-md'
        )}
        onClick={() => {
          if (!added) onToggle(item);
        }}
      >
        <span
          className={cn(
            'relative block aspect-square w-full overflow-hidden bg-muted/50',
            added && 'opacity-40'
          )}
        >
          <img
            src={src}
            alt=''
            loading='lazy'
            className='size-full object-cover'
            style={checkerboardStyle}
          />
        </span>
        {picked ? (
          <span
            aria-hidden='true'
            className='absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'
          >
            {many ? number : <CheckIcon className='size-3.5' />}
          </span>
        ) : null}
        {added ? (
          <span className='absolute top-2 left-2 rounded-sm bg-card px-1.5 py-0.5 text-xs font-medium text-muted-foreground shadow-xs'>
            {ALREADY_ADDED}
          </span>
        ) : null}
        <span
          title={name}
          className={cn(
            'w-full truncate px-2.5 py-2 text-sm',
            added && 'text-muted-foreground'
          )}
        >
          {name}
        </span>
      </button>
    </li>
  );
}

export function MissingFileCard({
  path,
  folder,
  words,
}: {
  path: string;
  folder: string;
  words: string;
}) {
  return (
    <div
      data-slot='missing-file-card'
      className='mb-3 flex items-start gap-3 rounded-md border bg-muted/40 p-3'
    >
      <span className='flex size-10 shrink-0 items-center justify-center rounded-sm bg-muted text-muted-foreground'>
        <Icon glyph='image-missing' size={20} />
      </span>
      <div className='min-w-0 text-sm'>
        <p
          title={path}
          className='m-0 truncate font-medium line-through [overflow-wrap:anywhere]'
        >
          {mediaNameOf(path)}
        </p>
        <p className='m-0 mt-1 text-muted-foreground'>{words}</p>
        <span className='sr-only'>{folderNameOf(folder)}</span>
      </div>
    </div>
  );
}

export function LoadFailure({
  message,
  onRetry,
  retryLabel,
}: {
  message: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div role='alert' className='flex flex-col items-start gap-2 text-sm'>
      <p className='m-0'>{message}</p>
      <Button type='button' variant='outline' size='sm' onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
