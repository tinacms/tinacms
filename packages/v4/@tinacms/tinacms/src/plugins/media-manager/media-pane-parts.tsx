import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { cn } from '@tinacms/ui/lib/utils';
import { CheckIcon, FileIcon, FolderIcon, PlayIcon } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { MediaItem, MediaUrlOptions } from '../../core/media/contract';
import { checkerboardStyle } from './media-grid';
import { copyText } from './media-actions';
import {
  MEDIA_COPIED_MS,
  folderTrailOf,
  typeLabelOf,
} from './media-pane-words';
import {
  type MediaViewMode,
  isImage,
  isVideo,
  mediaNameOf,
  typeBadgeOf,
} from './media-types';
import { useMediaUsage } from './use-media-usage';

type ResolveUrl = (path: string, options?: MediaUrlOptions) => string;

/**
 * "Copy URL" and "Copy URLs": shows "Copied" with a tick for two seconds after a
 * successful write. `onResult` gets null when a copy starts and the failure notice when it fails.
 */
export function CopyButton({
  label,
  getText,
  disabled,
  announce,
  failure,
  onResult,
}: {
  label: string;
  getText: () => string;
  disabled?: boolean;
  announce: string;
  failure: string;
  onResult: (notice: string | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), MEDIA_COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={disabled}
        onClick={() => {
          onResult(null);
          void copyText(getText()).then((ok) => {
            setCopied(ok);
            if (!ok) onResult(failure);
          });
        }}
      >
        {copied ? (
          <>
            <Icon glyph={CheckIcon} size={14} />
            Copied
          </>
        ) : (
          label
        )}
      </Button>
      <span role='status' className='sr-only'>
        {copied ? announce : ''}
      </span>
    </>
  );
}

function FileThumb({
  path,
  resolveUrl,
  size,
}: {
  path: string;
  resolveUrl: ResolveUrl;
  size: number;
}) {
  const name = mediaNameOf(path);
  if (isImage(name)) {
    return (
      <img
        src={resolveUrl(path, { width: size, height: size })}
        alt=''
        loading='lazy'
        className='size-full object-cover'
        style={checkerboardStyle}
      />
    );
  }
  return (
    <span className='flex size-full items-center justify-center bg-muted'>
      <Icon
        glyph={isVideo(name) ? PlayIcon : FileIcon}
        size={20}
        className='text-muted-foreground'
      />
      {typeBadgeOf(name) ? (
        <span className='absolute bottom-1 left-1 rounded-xs bg-card px-1 text-[10px] font-medium'>
          {typeBadgeOf(name)}
        </span>
      ) : null}
    </span>
  );
}

function FileItem({
  item,
  mode,
  active,
  selecting,
  selected,
  resolveUrl,
  onChoose,
  onToggle,
  onFocus,
}: {
  item: MediaItem;
  mode: MediaViewMode;
  active: boolean;
  selecting: boolean;
  selected: boolean;
  resolveUrl: ResolveUrl;
  onChoose: (path: string) => void;
  onToggle: (path: string) => void;
  onFocus: () => void;
}) {
  const name = mediaNameOf(item.path);
  const disc = selecting ? (
    <span
      aria-hidden='true'
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full border bg-card',
        mode === 'grid' && 'absolute top-1.5 left-1.5',
        selected && 'border-primary bg-primary text-primary-foreground'
      )}
    >
      {selected ? <Icon glyph={CheckIcon} size={14} /> : null}
    </span>
  ) : null;
  const checkable = selecting
    ? ({ role: 'checkbox', 'aria-checked': selected } as const)
    : ({ 'aria-pressed': active } as const);
  return (
    <li
      className={mode === 'list' ? 'border-b border-border-subtle' : undefined}
    >
      <button
        type='button'
        aria-label={name}
        data-path={item.path}
        {...checkable}
        onFocus={onFocus}
        onClick={() => (selecting ? onToggle(item.path) : onChoose(item.path))}
        className={cn(
          'relative flex w-full text-left outline-none focus-visible:shadow-focus-ring',
          mode === 'grid'
            ? 'flex-col overflow-hidden rounded-md border bg-card'
            : 'items-center gap-3 px-2 py-1.5 hover:bg-muted/50',
          (active || selected) &&
            (mode === 'grid'
              ? 'border-primary ring-2 ring-primary/20'
              : 'bg-primary/10')
        )}
      >
        {mode === 'list' ? disc : null}
        <span
          className={cn(
            'relative block overflow-hidden',
            mode === 'grid'
              ? 'aspect-square w-full'
              : 'size-10 shrink-0 rounded-sm'
          )}
        >
          <FileThumb
            path={item.path}
            resolveUrl={resolveUrl}
            size={mode === 'grid' ? 400 : 80}
          />
          {mode === 'grid' ? disc : null}
        </span>
        <span
          title={name}
          className={cn(
            'min-w-0 truncate text-sm',
            mode === 'grid' && 'px-2.5 py-2'
          )}
        >
          {name}
        </span>
      </button>
    </li>
  );
}

function FolderItem({
  item,
  mode,
  onOpen,
}: {
  item: MediaItem;
  mode: MediaViewMode;
  onOpen: (path: string) => void;
}) {
  const name = mediaNameOf(item.path);
  return (
    <li
      className={mode === 'list' ? 'border-b border-border-subtle' : undefined}
    >
      <button
        type='button'
        onClick={() => onOpen(item.path)}
        className={cn(
          'flex w-full items-center gap-2 text-left text-sm outline-none focus-visible:shadow-focus-ring',
          mode === 'grid'
            ? 'rounded-md border bg-card px-3 py-3'
            : 'px-2 py-2 hover:bg-muted/50'
        )}
      >
        <Icon glyph={FolderIcon} size={16} className='text-primary' />
        <span title={name} className='min-w-0 truncate font-medium'>
          {name}
        </span>
      </button>
    </li>
  );
}

/** Folders first, then files, as tiles or rows. Folders are never checkable. */
export function MediaItems({
  items,
  mode,
  activePath,
  selecting,
  selected,
  resolveUrl,
  loadingMore,
  onOpenFolder,
  onChoose,
  onToggle,
  onFocusLast,
}: {
  items: readonly MediaItem[];
  mode: MediaViewMode;
  activePath: string | null;
  selecting: boolean;
  selected: ReadonlySet<string>;
  resolveUrl: ResolveUrl;
  loadingMore: boolean;
  onOpenFolder: (path: string) => void;
  onChoose: (path: string) => void;
  onToggle: (path: string) => void;
  onFocusLast: () => void;
}) {
  const ordered = [
    ...items.filter((item) => item.kind === 'directory'),
    ...items.filter((item) => item.kind === 'file'),
  ];
  const last = ordered.length - 1;
  return (
    <ul
      aria-label='Items'
      className={cn(
        'm-0 list-none p-0',
        mode === 'grid'
          ? 'grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3'
          : 'flex flex-col'
      )}
    >
      {ordered.map((item, index) =>
        item.kind === 'directory' ? (
          <FolderItem
            key={item.path}
            item={item}
            mode={mode}
            onOpen={onOpenFolder}
          />
        ) : (
          <FileItem
            key={item.path}
            item={item}
            mode={mode}
            active={item.path === activePath}
            selecting={selecting}
            selected={selected.has(item.path)}
            resolveUrl={resolveUrl}
            onChoose={onChoose}
            onToggle={onToggle}
            onFocus={index === last ? onFocusLast : () => {}}
          />
        )
      )}
      {loadingMore
        ? Array.from({ length: 6 }, (_, index) => (
            <li key={`more-${index}`} aria-hidden='true'>
              <Skeleton shape='block' className='aspect-square' />
            </li>
          ))
        : null}
    </ul>
  );
}

export function LoadingLook({
  label,
  mode,
}: {
  label: string;
  mode: MediaViewMode;
}) {
  return (
    <div
      role='status'
      aria-label={label}
      className={
        mode === 'grid'
          ? 'grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3'
          : 'flex flex-col gap-2'
      }
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton
          key={index}
          shape='block'
          className={mode === 'grid' ? 'aspect-square' : 'h-10'}
        />
      ))}
    </div>
  );
}

export function StateLook({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className='flex flex-col items-center gap-2 p-8 text-center'>
      <p className='m-0 text-base font-medium'>{title}</p>
      {children}
    </div>
  );
}

/** The details of one file: the whole picture, the facts, Copy URL and Delete. */
export function MediaDetails({
  path,
  resolveUrl,
  canDelete,
  wide,
  onClose,
  onDelete,
  getUrl,
  onCopyResult,
}: {
  path: string;
  resolveUrl: ResolveUrl;
  canDelete: boolean;
  wide: boolean;
  onClose: () => void;
  onDelete: () => void;
  getUrl: () => string;
  onCopyResult: (notice: string | null) => void;
}) {
  const name = mediaNameOf(path);
  const folder = path.split('/').slice(0, -1).join('/');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const usage = useMediaUsage([path], true);
  const documents = new Set(
    (usage.data?.uses.get(path) ?? []).map((use) => use.documentPath)
  ).size;
  return (
    <section
      aria-label={`Details of ${name}`}
      className={cn(
        'flex min-h-0 min-w-0 flex-col',
        wide ? 'w-72 shrink-0 border-l border-border' : 'flex-1'
      )}
    >
      {wide ? (
        <div className='flex justify-end p-1'>
          <Button
            type='button'
            variant='icon'
            size='sm'
            icon='close'
            aria-label='Close details'
            onClick={onClose}
          />
        </div>
      ) : null}
      <div className='min-h-0 flex-1 overflow-y-auto p-3'>
        <div className='mb-3 flex max-h-80 items-center justify-center overflow-hidden rounded-md bg-muted'>
          {isImage(name) ? (
            <img
              src={resolveUrl(path)}
              alt={name}
              className='max-h-80 max-w-full object-contain'
              style={checkerboardStyle}
            />
          ) : (
            <span className='p-8 text-sm font-medium text-muted-foreground'>
              {typeBadgeOf(name) ?? 'File'}
            </span>
          )}
        </div>
        <h3
          ref={heading}
          tabIndex={-1}
          className='m-0 mb-1 text-base font-semibold [overflow-wrap:anywhere] outline-none'
        >
          {name}
        </h3>
        {documents > 0 ? (
          <p className='m-0 mb-3 text-sm text-muted-foreground'>
            Used in {documents} {documents === 1 ? 'document' : 'documents'}
          </p>
        ) : null}
        <dl className='m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm'>
          <dt className='text-muted-foreground'>Folder</dt>
          <dd className='m-0 [overflow-wrap:anywhere]'>
            {folderTrailOf(folder)}
          </dd>
          <dt className='text-muted-foreground'>Type</dt>
          <dd className='m-0'>{typeLabelOf(path)}</dd>
        </dl>
      </div>
      <div className='flex items-center gap-2 border-t border-border-subtle p-2'>
        <CopyButton
          label='Copy URL'
          announce='URL copied'
          failure="Couldn't copy the URL."
          onResult={onCopyResult}
          getText={getUrl}
        />
        <Button
          type='button'
          variant='destructive'
          size='sm'
          disabled={!canDelete}
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </section>
  );
}

export function SelectBar({
  count,
  loadedCount,
  hasMove,
  locked,
  getUrls,
  onCopyResult,
  onSelectAll,
  onClear,
  onCancel,
  onDownload,
  onMove,
  onDelete,
}: {
  count: number;
  loadedCount: number;
  hasMove: boolean;
  locked: boolean;
  getUrls: () => string;
  onCopyResult: (notice: string | null) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onCancel: () => void;
  onDownload: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  const none = count === 0;
  return (
    <div
      role='toolbar'
      aria-label='Selected files'
      className='flex flex-col gap-2 border-b border-border-subtle px-3 py-2'
    >
      <div className='flex items-center gap-2'>
        <button
          type='button'
          aria-label={count > 0 ? 'Clear selection' : 'Select all'}
          disabled={loadedCount === 0}
          onClick={count > 0 ? onClear : onSelectAll}
          className='flex size-5 items-center justify-center rounded-full border bg-card outline-none focus-visible:shadow-focus-ring'
        >
          {count > 0 ? <Icon glyph={CheckIcon} size={14} /> : null}
        </button>
        <span role='status' className='text-sm'>
          {count} selected
        </span>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='ml-auto'
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
      <div className='flex flex-wrap items-center gap-2 max-sm:grid max-sm:grid-cols-2 max-sm:[&>button]:w-full'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={none}
          onClick={onDownload}
        >
          Download
        </Button>
        <CopyButton
          label='Copy URLs'
          announce='URLs copied'
          failure="Couldn't copy the URLs."
          onResult={onCopyResult}
          getText={getUrls}
          disabled={none}
        />
        {hasMove ? (
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={none || locked}
            onClick={onMove}
          >
            Move
          </Button>
        ) : null}
        <Button
          type='button'
          variant='destructive'
          size='sm'
          disabled={none || locked}
          onClick={onDelete}
        >
          {none ? 'Delete' : `Delete ${count}`}
        </Button>
      </div>
    </div>
  );
}
