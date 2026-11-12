import { Button, buttonVariants } from '@tinacms/ui/components/button';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { cn } from '@tinacms/ui/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { type DragEvent, useEffect, useRef, useState } from 'react';
import type {
  MediaItem,
  MediaPageRequest,
  MediaStatus,
} from '../../core/media/contract';
import {
  MEDIA_LIST_KEY,
  useMediaListing,
  useMediaStatus,
} from './use-media-listing';
import { useCurrentBranch } from '../../editor/content-queries';
import { useMediaSlice } from '../../editor/hooks';
import { MediaBreadcrumb } from './media-breadcrumb';
import { NewFolderDialog } from './media-dialogs';
import {
  LockedAcceptChip,
  MediaKindToggle,
  MediaSearchInput,
  MediaTypeFilter,
  ViewModeToggle,
} from './media-filters';
import { MediaGrid } from './media-grid';
import { Icon } from '@tinacms/ui/components/icon';
import {
  CircleAlertIcon,
  ExternalLinkIcon,
  FolderPlusIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { MediaPreview } from './media-preview';
import {
  DEFAULT_UPLOAD_RULES,
  type MediaAccept,
  type MediaKindFilter,
  type MediaTypeFilterValue,
  type MediaViewMode,
  joinMediaPath,
  mediaNameOf,
  resolveMediaAccept,
  type UploadRules,
  extensionsForCategory,
  inputAcceptOf,
  uploadRulesOf,
  uploadRejectionOf,
} from './media-types';
import { MediaUploadButton } from './media-upload';

const SEARCH_DEBOUNCE_MS = 300;

type ModeProps = {
  mode: 'pick';
  onSelect: (item: MediaItem) => void;
  accept?: MediaAccept | MediaAccept[];
};

type FolderProps =
  | { folder: string; onFolderChange: (folder: string) => void }
  | { folder?: undefined; onFolderChange?: undefined };

export type MediaBrowserProps = ModeProps & FolderProps;

interface MediaAlert {
  title: string;
  lines: string[];
}

const messageOf = (cause: unknown): string => {
  if (cause instanceof Error) {
    return cause.message;
  } else {
    return String(cause);
  }
};

const parentOf = (path: string): string =>
  path.split('/').slice(0, -1).join('/');

function LoadingGrid({ label }: { label: string }) {
  return (
    <div
      role='status'
      aria-label={label}
      className='grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4'
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} shape='block' className='aspect-square' />
      ))}
    </div>
  );
}

function SetupBanner({
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

export function MediaBrowser(props: MediaBrowserProps) {
  const media = useMediaSlice();
  const branch = useCurrentBranch() ?? '';
  const queryClient = useQueryClient();
  const [localFolder, setLocalFolder] = useState('');
  const folder = props.folder ?? localFolder;
  const openFolder = props.onFolderChange ?? setLocalFolder;

  const resolveUrl: typeof media.resolveUrl = (path, options) =>
    media.resolveUrl(path, options);
  const features = media.features ?? {};
  const readOnly = features.readOnly === true;
  const pickAccept = props.accept !== undefined ? [props.accept].flat() : [];
  const pickExtensions = resolveMediaAccept(pickAccept);
  const providerRestrictsTypes =
    features.acceptedMimeTypes !== undefined ||
    features.acceptedExtensions !== undefined;
  const uploadRules: UploadRules =
    pickExtensions.length > 0
      ? uploadRulesOf(pickExtensions)
      : providerRestrictsTypes
        ? {
            mimeTypes: features.acceptedMimeTypes ?? [],
            extensions: features.acceptedExtensions ?? [],
          }
        : DEFAULT_UPLOAD_RULES;

  const [viewMode, setViewMode] = useState<MediaViewMode>('grid');
  const [kindFilter, setKindFilter] = useState<MediaKindFilter>('all');
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilterValue>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activePath, setActivePath] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<{
    folder: string;
    items: MediaItem[];
  }>({ folder, items: [] });
  const [dialog, setDialog] = useState<'new-folder' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<MediaAlert | null>(null);

  const [shownFolder, setShownFolder] = useState(folder);
  if (shownFolder !== folder) {
    setShownFolder(folder);
    setSearch('');
    setDebouncedSearch('');
    setActivePath(null);
    setNotice(null);
    setUploaded({ folder, items: [] });
  }

  useEffect(() => {
    const next = search.trim();
    if (next === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(next);
      setActivePath(null);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const extensions: string[] = !features.extensionFilter
    ? []
    : pickExtensions.length > 0
      ? pickExtensions
      : typeFilter === 'all'
        ? []
        : extensionsForCategory(typeFilter);
  const request: MediaPageRequest = {
    search: features.search && debouncedSearch ? debouncedSearch : undefined,
    extensions: extensions.length > 0 ? extensions : undefined,
  };

  const listing = useMediaListing(folder, request);
  const status = useMediaStatus();

  const uploadedItems = uploaded.folder === folder ? uploaded.items : [];
  const uploadedPaths = new Set(uploadedItems.map((item) => item.path));
  const listedItems = (
    listing.data?.pages.flatMap((page) => page.items) ?? []
  ).filter((item) => !uploadedPaths.has(item.path));
  const allItems = [...uploadedItems, ...listedItems];
  const visibleItems = allItems.filter((item) => {
    if (kindFilter === 'folders') return item.kind === 'directory';
    if (kindFilter === 'files') return item.kind === 'file';
    return true;
  });
  const activeItem =
    allItems.find((item) => item.kind === 'file' && item.path === activePath) ??
    null;

  const showSentinel = listing.hasNextPage && kindFilter !== 'folders';
  const { fetchNextPage, isFetchingNextPage } = listing;
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!showSentinel || isFetchingNextPage || !sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void fetchNextPage();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showSentinel, isFetchingNextPage, fetchNextPage]);

  const refreshListing = () =>
    queryClient.invalidateQueries({
      queryKey: [...MEDIA_LIST_KEY, branch, folder],
    });

  const refresh = () => {
    setActivePath(null);
    setNotice(null);
    setUploaded({ folder, items: [] });
    void refreshListing();
  };

  const upload = async (files: File[]) => {
    const failures: string[] = [];
    const accepted: File[] = [];
    for (const file of files) {
      const rejection = uploadRejectionOf(file, uploadRules, features.maxSize);
      if (rejection) {
        failures.push(`${file.name}: ${rejection}`);
      } else {
        accepted.push(file);
      }
    }
    setNotice(null);
    const target = folder;
    const added: MediaItem[] = [];
    if (accepted.length > 0) {
      setUploading(true);
      for (const file of accepted) {
        try {
          added.push({ path: await media.upload(file, target), kind: 'file' });
        } catch (cause) {
          failures.push(`${file.name}: ${messageOf(cause)}`);
        }
      }
      setUploading(false);
    }
    if (failures.length > 0) {
      setNotice({ title: 'Upload failed.', lines: failures });
    }
    if (added.length === 0) return;
    setUploaded((previous) => {
      if (previous.folder !== target) return previous;
      const addedPaths = new Set(added.map((item) => item.path));
      return {
        folder: target,
        items: [
          ...added,
          ...previous.items.filter((item) => !addedPaths.has(item.path)),
        ],
      };
    });
    setActivePath(added[0]?.path ?? null);
    if (kindFilter === 'folders') setKindFilter('all');
    setSearch('');
    setDebouncedSearch('');
    void refreshListing();
  };

  const clickItem = (item: MediaItem) => {
    if (item.kind === 'directory') {
      openFolder(item.path);
    } else {
      setActivePath((current) => (current === item.path ? null : item.path));
    }
  };

  const dragOver = (event: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    event.preventDefault();
    setDragging(true);
  };

  const dragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDragging(false);
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    event.preventDefault();
    setDragging(false);
    const files = [...event.dataTransfer.files];
    if (files.length > 0) void upload(files);
  };

  if (status.data?.kind === 'needs-setup') {
    return <SetupBanner status={status.data} />;
  }

  let emptyMessage = 'Drag and drop assets here';
  if (debouncedSearch && features.search) {
    emptyMessage =
      kindFilter === 'folders'
        ? 'No folders match'
        : `No media matches “${debouncedSearch}”`;
  } else if (kindFilter === 'folders') {
    emptyMessage = 'No folders here';
  } else if (kindFilter === 'files') {
    emptyMessage = 'No files here';
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col'>
      <div className='flex flex-wrap items-center gap-4 border-b px-4 py-3'>
        <div className='flex min-w-0 flex-1 items-center gap-4'>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <MediaBreadcrumb folder={folder} onOpen={openFolder} />
        </div>
        {readOnly ? null : (
          <div className='flex flex-wrap items-center gap-2'>
            <Button type='button' variant='outline' onClick={refresh}>
              Refresh
              <Icon glyph={RefreshCwIcon} size={16} />
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDialog('new-folder')}
            >
              New Folder
              <Icon glyph={FolderPlusIcon} size={16} />
            </Button>
            <MediaUploadButton
              uploading={uploading}
              accept={inputAcceptOf(uploadRules)}
              onUpload={(files) => void upload(files)}
            />
          </div>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-4 border-b px-4 py-3'>
        {features.search ? (
          <MediaSearchInput value={search} onChange={setSearch} />
        ) : null}
        <div className='ml-auto flex flex-wrap items-center justify-end gap-3'>
          {features.extensionFilter ? (
            pickExtensions.length > 0 ? (
              <LockedAcceptChip
                accept={pickAccept}
                extensions={pickExtensions}
              />
            ) : (
              <MediaTypeFilter
                value={typeFilter}
                onChange={(next) => {
                  setTypeFilter(next);
                  setActivePath(null);
                }}
              />
            )
          ) : null}
          <MediaKindToggle value={kindFilter} onChange={setKindFilter} />
        </div>
      </div>

      {notice ? (
        <div
          role='alert'
          className='border-b bg-destructive/10 px-4 py-2 text-sm text-destructive'
        >
          <p className='font-medium'>{notice.title}</p>
          <ul>
            {notice.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className='flex min-h-0 flex-1'>
        <div
          role='region'
          aria-label='Media library'
          data-dragging={dragging ? 'true' : undefined}
          className={cn(
            'min-w-0 flex-1 overflow-y-auto border-2 border-transparent p-4 transition',
            dragging ? 'rounded-sm border-orange-500' : null
          )}
          onDragEnter={dragOver}
          onDragOver={dragOver}
          onDragLeave={dragLeave}
          onDrop={drop}
        >
          {listing.isPending ? (
            <LoadingGrid label='Loading media' />
          ) : listing.isError ? (
            <div
              role='alert'
              className='flex flex-col items-start gap-2 text-sm'
            >
              <p>Could not load media: {messageOf(listing.error)}</p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => listing.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <>
              {visibleItems.length === 0 && !showSentinel ? (
                <p className='p-12 text-center text-xl text-muted-foreground'>
                  {emptyMessage}
                </p>
              ) : (
                <MediaGrid
                  items={visibleItems}
                  viewMode={viewMode}
                  activePath={activeItem?.path ?? null}
                  newPaths={uploadedPaths}
                  resolveUrl={resolveUrl}
                  onClick={clickItem}
                />
              )}
              {showSentinel ? (
                <div ref={sentinelRef} className='mt-4'>
                  <LoadingGrid label='Loading more media' />
                </div>
              ) : null}
            </>
          )}
        </div>

        {activeItem ? (
          <MediaPreview
            item={activeItem}
            resolveUrl={resolveUrl}
            onClose={() => setActivePath(null)}
            onInsert={props.onSelect}
          />
        ) : null}
      </div>

      {dialog === 'new-folder' ? (
        <NewFolderDialog
          onCreate={(name) => openFolder(joinMediaPath(folder, name))}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </div>
  );
}
