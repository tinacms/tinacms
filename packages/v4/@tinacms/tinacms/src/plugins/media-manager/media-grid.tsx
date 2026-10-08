import { Badge } from '@tinacms/ui/components/badge';
import { cn } from '@tinacms/ui/lib/utils';
import { useId } from 'react';
import type { MediaItem, MediaUrlOptions } from '../../core/media/contract';
import { ClapperboardIcon, FileIcon, FolderIcon, PlayIcon } from 'lucide-react';
import {
  type MediaViewMode,
  isImage,
  isVideo,
  mediaNameOf,
  typeBadgeOf,
} from './media-types';

type ResolveUrl = (path: string, options?: MediaUrlOptions) => string;

export const checkerboardStyle = {
  backgroundImage:
    'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
};

interface MediaListProps {
  items: MediaItem[];
  activePath: string | null;
  newPaths: ReadonlySet<string>;
  resolveUrl: ResolveUrl;
  onClick: (item: MediaItem) => void;
}

const tileLabel = (name: string, isNew: boolean) =>
  isNew ? `${name} (new)` : name;

function NewBadge() {
  return (
    <Badge className='absolute top-2 right-2 z-10 bg-status-published-subtle text-[10px] font-bold tracking-wide text-status-published'>
      NEW
    </Badge>
  );
}

function GridFolderTile({
  item,
  onClick,
}: {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}) {
  const name = mediaNameOf(item.path);
  return (
    <li>
      <button
        type='button'
        className='flex w-full flex-col overflow-hidden rounded-md border bg-card text-left shadow-sm transition outline-none hover:border-primary/40 hover:shadow-md focus-visible:focus-ring'
        onClick={() => onClick(item)}
      >
        <span className='flex h-24 items-center justify-center'>
          <FolderIcon className='size-11 text-primary' />
        </span>
        <span
          title={name}
          className='w-full truncate border-t px-3 py-2 text-sm font-medium'
        >
          {name}
        </span>
      </button>
    </li>
  );
}

function GridFileTile({
  item,
  active,
  isNew,
  resolveUrl,
  onClick,
}: {
  item: MediaItem;
  active: boolean;
  isNew: boolean;
  resolveUrl: ResolveUrl;
  onClick: (item: MediaItem) => void;
}) {
  const name = mediaNameOf(item.path);
  const badge = typeBadgeOf(name);
  const video = isVideo(name);
  return (
    <li>
      <button
        type='button'
        aria-label={tileLabel(name, isNew)}
        aria-pressed={active}
        className={cn(
          'relative flex w-full flex-col overflow-hidden rounded-md border bg-card text-left shadow-sm transition outline-none focus-visible:focus-ring',
          active
            ? 'border-2 border-primary shadow-md ring-2 ring-primary/20'
            : 'hover:border-primary/40 hover:shadow-md'
        )}
        onClick={() => onClick(item)}
      >
        {isNew ? <NewBadge /> : null}
        <span className='relative block aspect-square w-full overflow-hidden bg-muted/50'>
          {isImage(name) ? (
            <img
              src={resolveUrl(item.path, { width: 400, height: 400 })}
              alt={name}
              loading='lazy'
              className='size-full object-cover'
              style={checkerboardStyle}
            />
          ) : video ? (
            <span className='flex size-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900'>
              <span className='flex size-10 items-center justify-center rounded-full bg-white/90 shadow'>
                <PlayIcon
                  className='ml-0.5 size-4 text-slate-700'
                  fill='currentColor'
                />
              </span>
            </span>
          ) : (
            <span className='flex size-full items-center justify-center'>
              <FileIcon className='size-2/5 text-muted-foreground' />
            </span>
          )}
          {badge ? (
            <span className='absolute bottom-2 left-2 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white'>
              {badge}
            </span>
          ) : null}
        </span>
        <span title={name} className='w-full truncate px-2.5 py-2 text-sm'>
          {name}
        </span>
      </button>
    </li>
  );
}

function ListRow({
  item,
  active,
  isNew,
  resolveUrl,
  onClick,
}: {
  item: MediaItem;
  active: boolean;
  isNew: boolean;
  resolveUrl: ResolveUrl;
  onClick: (item: MediaItem) => void;
}) {
  const name = mediaNameOf(item.path);
  const folder = item.kind === 'directory';
  const Icon = folder
    ? FolderIcon
    : isVideo(name)
      ? ClapperboardIcon
      : FileIcon;
  return (
    <li className='border-b'>
      <button
        type='button'
        aria-label={tileLabel(name, isNew)}
        aria-pressed={folder ? undefined : active}
        className={cn(
          'relative flex w-full items-center text-left transition outline-none hover:bg-muted/50 focus-visible:focus-ring-inset',
          active ? 'bg-selected text-selected-foreground' : null
        )}
        onClick={() => onClick(item)}
      >
        {isNew ? <NewBadge /> : null}
        <span className='flex size-16 shrink-0 items-center justify-center overflow-hidden'>
          {!folder && isImage(name) ? (
            <img
              src={resolveUrl(item.path, { width: 75, height: 75 })}
              alt={name}
              loading='lazy'
              className='max-h-full max-w-full object-contain'
              style={checkerboardStyle}
            />
          ) : (
            <Icon
              className={cn(
                'size-8',
                folder ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          )}
        </span>
        <span title={name} className='w-full truncate px-3 py-2'>
          {name}
        </span>
      </button>
    </li>
  );
}

export function MediaGrid({
  items,
  activePath,
  newPaths,
  resolveUrl,
  onClick,
  viewMode,
}: MediaListProps & { viewMode: MediaViewMode }) {
  const headingId = useId();
  if (viewMode === 'list') {
    return (
      <ul aria-label='Media' className='flex w-full flex-col'>
        {items.map((item) => (
          <ListRow
            key={item.path}
            item={item}
            active={item.path === activePath}
            isNew={newPaths.has(item.path)}
            resolveUrl={resolveUrl}
            onClick={onClick}
          />
        ))}
      </ul>
    );
  }

  const folders = items.filter((item) => item.kind === 'directory');
  const files = items.filter((item) => item.kind === 'file');
  return (
    <div className='flex flex-col gap-6'>
      {folders.length > 0 ? (
        <section aria-labelledby={`${headingId}-folders`}>
          <h3
            id={`${headingId}-folders`}
            className='mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase'
          >
            Folders
          </h3>
          <ul
            aria-label='Folders'
            className='grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4'
          >
            {folders.map((item) => (
              <GridFolderTile key={item.path} item={item} onClick={onClick} />
            ))}
          </ul>
        </section>
      ) : null}
      {files.length > 0 ? (
        <section aria-labelledby={`${headingId}-files`}>
          <h3
            id={`${headingId}-files`}
            className='mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase'
          >
            Files
          </h3>
          <ul
            aria-label='Files'
            className='grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4'
          >
            {files.map((item) => (
              <GridFileTile
                key={item.path}
                item={item}
                active={item.path === activePath}
                isNew={newPaths.has(item.path)}
                resolveUrl={resolveUrl}
                onClick={onClick}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
