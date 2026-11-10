import { useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { cn } from '@tinacms/ui/lib/utils';
import { ExternalLinkIcon, FolderPlusIcon } from 'lucide-react';
import {
  type DragEvent,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { MediaPaneShellContext } from '../../admin/media-pane-shell';
import { HOME_ROUTE } from '../../admin/routing';
import { useAdminRoute } from '../../admin/use-admin-route';
import { useNarrow } from '../../admin/use-narrow';
import type { AdminScreenProps } from '../../core/screen/contract';
import { useMediaSlice } from '../../editor/hooks';
import { absoluteUrlsOf, downloadFiles } from './media-actions';
import {
  DeleteConfirm,
  MoveDialog,
  NewFolderForm,
  type OpenableUse,
} from './media-change-dialogs';
import { MediaBreadcrumb } from './media-breadcrumb';
import { ViewModeToggle } from './media-filters';
import { MEDIA_SCREEN_NAME } from './media-manager.plugin';
import {
  LoadingLook,
  MediaDetails,
  MediaItems,
  SelectBar,
  StateLook,
} from './media-pane-parts';
import {
  READ_ONLY_NOTE,
  NO_PERMISSION_NOTE,
  countLine,
  downloadFailureMessage,
} from './media-pane-words';
import {
  DEFAULT_UPLOAD_RULES,
  type MediaViewMode,
  inputAcceptOf,
  mediaNameOf,
  uploadRejectionOf,
  type UploadRules,
} from './media-types';
import { MediaUploadButton } from './media-upload';
import { type ChangeResult, useMediaChanges } from './use-media-changes';
import {
  MEDIA_LIST_KEY,
  useMediaListing,
  useMediaStatus,
} from './use-media-listing';

const SEARCH_DEBOUNCE_MS = 300;
const NEAR_END_PX = 120;
const DETAILS_BESIDE_MIN_PX = 640;

type Confirm = { kind: 'delete' | 'move'; paths: readonly string[] };

const messageOf = (cause: unknown): string => {
  if (cause instanceof Error) {
    return cause.message;
  } else {
    return String(cause);
  }
};

const parentOf = (path: string): string =>
  path.split('/').slice(0, -1).join('/');

// A ResizeObserver-less environment reads as narrow, so details replace the library.
function useWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** The Media screen: a pane beside the side nav that browses and manages files. */
export function MediaPane({ segments }: AdminScreenProps) {
  const media = useMediaSlice();
  const { navigate } = useAdminRoute();
  const shell = use(MediaPaneShellContext);
  const queryClient = useQueryClient();
  const narrow = useNarrow();
  const root = useRef<HTMLElement>(null);
  const library = useRef<HTMLDivElement>(null);
  const paneWidth = useWidth(root);
  const wide = paneWidth >= DETAILS_BESIDE_MIN_PX;

  const folder = segments.join('/');
  const folderName = folder ? mediaNameOf(folder) : 'Media';
  const features = media.features ?? {};
  const readOnly = features.readOnly === true;
  const hasMove = typeof media.rename === 'function';
  const resolveUrl: typeof media.resolveUrl = (path, options) =>
    media.resolveUrl(path, options);

  const openFolder = (next: string) =>
    navigate({
      view: 'screen',
      screen: MEDIA_SCREEN_NAME,
      segments: next ? next.split('/') : [],
    });

  const [viewMode, setViewMode] = useState<MediaViewMode>('grid');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activePath, setActivePath] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [newFolder, setNewFolder] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<string | null | undefined>(undefined);

  const [shownFolder, setShownFolder] = useState(folder);
  if (shownFolder !== folder) {
    setShownFolder(folder);
    setSearch('');
    setDebouncedSearch('');
    setActivePath(null);
    setSelecting(false);
    setSelected(new Set());
    setNotice(null);
  }

  useEffect(() => {
    const next = search.trim();
    if (next === debouncedSearch) return;
    const timer = setTimeout(
      () => setDebouncedSearch(next),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const searching = features.search === true && debouncedSearch !== '';
  const status = useMediaStatus();
  const listing = useMediaListing(folder, {
    search: searching ? debouncedSearch : undefined,
  });
  const loadFailed = listing.isError && listing.data === undefined;
  const items = listing.data?.pages.flatMap((page) => page.items) ?? [];
  const folders = items.filter((item) => item.kind === 'directory');
  const files = items.filter((item) => item.kind === 'file');
  const filePaths = files.map((item) => item.path);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = listing;

  const changes = useMediaChanges(
    (result: ChangeResult) => {
      const gone = new Set(result.succeeded);
      setSelected(
        (current) => new Set([...current].filter((p) => !gone.has(p)))
      );
      if (result.succeeded.length === result.change.paths.length) {
        setSelecting(false);
      }
      if (activePath !== null && gone.has(activePath)) setActivePath(null);
      if (result.change.kind === 'delete' && result.succeeded.length > 0) {
        const lastIndex = filePaths.findLastIndex((path) => gone.has(path));
        pendingFocus.current =
          filePaths.slice(lastIndex + 1).find((path) => !gone.has(path)) ??
          null;
      }
    },
    () => setSelected(new Set())
  );
  useEffect(() => {
    if (pendingFocus.current === undefined) return;
    const target = pendingFocus.current;
    pendingFocus.current = undefined;
    const button =
      target === null
        ? null
        : library.current?.querySelector<HTMLElement>(
            `[data-path="${CSS.escape(target)}"]`
          );
    (button ?? library.current)?.focus();
  }, [items.length]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };

  const locked = readOnly || changes.locked;
  const actionsOff = locked || changes.busy;
  const lockNote = readOnly
    ? READ_ONLY_NOTE
    : changes.locked
      ? NO_PERMISSION_NOTE
      : null;
  const detailsFill = activePath !== null && !wide;
  const needsSetup = status.data?.kind === 'needs-setup' ? status.data : null;

  const uploadRules: UploadRules =
    features.acceptedMimeTypes !== undefined ||
    features.acceptedExtensions !== undefined
      ? {
          mimeTypes: features.acceptedMimeTypes ?? [],
          extensions: features.acceptedExtensions ?? [],
        }
      : DEFAULT_UPLOAD_RULES;

  const upload = async (picked: File[]) => {
    const failures: string[] = [];
    setNotice(null);
    setUploading(true);
    for (const file of picked) {
      const rejection = uploadRejectionOf(file, uploadRules, features.maxSize);
      if (rejection) {
        failures.push(`${file.name}: ${rejection}`);
        continue;
      }
      try {
        await media.upload(file, folder);
      } catch (cause) {
        failures.push(`${file.name}: ${messageOf(cause)}`);
      }
    }
    setUploading(false);
    if (failures.length > 0) setNotice(`Upload failed. ${failures.join(' ')}`);
    void queryClient.invalidateQueries({ queryKey: [...MEDIA_LIST_KEY] });
  };

  const dragOver = (event: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    event.preventDefault();
    setDragging(true);
  };
  const drop = (event: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    event.preventDefault();
    setDragging(false);
    const dropped = [...event.dataTransfer.files];
    if (dropped.length > 0) void upload(dropped);
  };

  const openConfirm = (kind: Confirm['kind'], paths: readonly string[]) => {
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setConfirm({ kind, paths });
  };
  const cancelConfirm = () => {
    setConfirm(null);
    const back = trigger.current;
    setTimeout(() => back?.focus(), 0);
  };
  const openDocument = (use: OpenableUse) => {
    setConfirm(null);
    navigate({
      view: 'document',
      collection: use.collection,
      path: use.documentPath,
    });
  };

  const toggle = (path: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(path)) next.add(path);
      return next;
    });
  const leaveSelecting = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const selectedPaths = filePaths.filter((path) => selected.has(path));

  const closeDetails = () => {
    const path = activePath;
    setActivePath(null);
    if (path === null) return;
    setTimeout(() => {
      library.current
        ?.querySelector<HTMLElement>(`[data-path="${CSS.escape(path)}"]`)
        ?.focus();
    }, 0);
  };

  const escape = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (confirm || newFolder || changes.dialog) return;
    if (activePath !== null) {
      closeDetails();
    } else if (selecting) {
      leaveSelecting();
    }
  });
  useEffect(() => {
    const listen = (event: globalThis.KeyboardEvent) => escape(event);
    document.addEventListener('keydown', listen);
    return () => document.removeEventListener('keydown', listen);
  }, []);

  const back = detailsFill
    ? closeDetails
    : folder
      ? () => openFolder(parentOf(folder))
      : undefined;

  const uploadAction =
    readOnly || needsSetup ? undefined : (
      <MediaUploadButton
        uploading={uploading}
        accept={inputAcceptOf(uploadRules)}
        onUpload={(picked) => void upload(picked)}
      />
    );

  const count = countLine(folders.length, files.length, hasNextPage);
  const hits = `${files.length}${hasNextPage ? '+' : ''}`;

  return (
    <MediaPaneRoot rootRef={root} maximised={shell?.maximised ?? false}>
      <PanelHeader
        heading={back ? undefined : 'Media'}
        backLabel={back ? 'Back' : undefined}
        backTitle={detailsFill ? 'Back to files' : 'Back to the folder above'}
        onBack={back}
        action={uploadAction}
        closeLabel='Close'
        onClose={() => (shell ? shell.close() : navigate(HOME_ROUTE))}
        maximised={shell?.maximised ?? false}
        onMaximise={shell && !narrow ? shell.toggleMaximise : undefined}
      />

      {lockNote ? (
        <p className='m-0 border-b border-border-subtle bg-muted/50 px-3 py-2 text-sm'>
          {lockNote}
        </p>
      ) : null}

      {needsSetup ? (
        <div className='flex flex-col items-start gap-2 p-4 text-sm'>
          <p className='m-0'>{needsSetup.message}</p>
          <a
            href={needsSetup.actionUrl}
            target='_blank'
            rel='noreferrer noopener'
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            {needsSetup.actionLabel}
            <Icon glyph={ExternalLinkIcon} size={14} />
          </a>
        </div>
      ) : (
        <>
          {detailsFill ? null : selecting ? (
            <SelectBar
              count={selectedPaths.length}
              loadedCount={filePaths.length}
              hasMove={hasMove}
              locked={actionsOff}
              getUrls={() => absoluteUrlsOf(selectedPaths, resolveUrl)}
              onSelectAll={() => setSelected(new Set(filePaths))}
              onClear={() => setSelected(new Set())}
              onCancel={leaveSelecting}
              onDownload={() => {
                setNotice(null);
                void downloadFiles(selectedPaths, resolveUrl).then((failed) => {
                  if (failed > 0) {
                    setNotice(
                      downloadFailureMessage(failed, selectedPaths.length)
                    );
                  }
                });
              }}
              onMove={() => openConfirm('move', selectedPaths)}
              onDelete={() => openConfirm('delete', selectedPaths)}
            />
          ) : loadFailed ? null : (
            <div className='flex flex-wrap items-center gap-2 border-b border-border-subtle px-3 py-2'>
              {features.search ? (
                <div className='min-w-40 flex-1'>
                  <SearchBox
                    label={`Search ${folderName} by file name`}
                    size='sm'
                    value={search}
                    results={
                      searching &&
                      search.trim() === debouncedSearch &&
                      !listing.isPending
                        ? hits
                        : undefined
                    }
                    onChange={(event) => setSearch(event.target.value)}
                    onClear={() => {
                      setSearch('');
                      setDebouncedSearch('');
                    }}
                  />
                </div>
              ) : (
                <span className='flex-1' />
              )}
              <ViewModeToggle value={viewMode} onChange={setViewMode} />
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={readOnly}
                onClick={() => setNewFolder(true)}
              >
                <Icon glyph={FolderPlusIcon} size={14} />
                New folder
              </Button>
              {filePaths.length > 0 ? (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setSelecting(true)}
                >
                  Select
                </Button>
              ) : null}
            </div>
          )}

          {notice ? (
            <p
              role='alert'
              className='m-0 border-b bg-destructive/10 px-3 py-2 text-sm text-destructive'
            >
              {notice}
            </p>
          ) : null}
          {changes.status ? (
            <div
              role={changes.status.tone === 'error' ? 'alert' : 'status'}
              className={cn(
                'flex items-center gap-2 border-b px-3 py-2 text-sm',
                changes.status.tone === 'error' &&
                  'bg-destructive/10 text-destructive'
              )}
            >
              <span className='min-w-0 flex-1'>{changes.status.text}</span>
              {changes.status.retry ? (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={changes.status.retry}
                >
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className='flex min-h-0 flex-1'>
            {detailsFill ? null : (
              <div
                ref={library}
                tabIndex={-1}
                role='region'
                aria-label={`Files in ${folderName}`}
                aria-busy={listing.isPending}
                data-dragging={dragging ? 'true' : undefined}
                className={cn(
                  'min-w-0 flex-1 overflow-y-auto p-3 outline-none',
                  dragging && 'ring-2 ring-primary'
                )}
                onScroll={(event) => {
                  const area = event.currentTarget;
                  if (
                    area.scrollHeight - area.scrollTop - area.clientHeight <
                    NEAR_END_PX
                  ) {
                    loadMore();
                  }
                }}
                onDragEnter={dragOver}
                onDragOver={dragOver}
                onDragLeave={() => setDragging(false)}
                onDrop={drop}
              >
                {folder ? (
                  <div className='mb-3'>
                    <MediaBreadcrumb folder={folder} onOpen={openFolder} />
                  </div>
                ) : null}
                {listing.isPending ? (
                  <LoadingLook
                    label={`Loading ${folderName}`}
                    mode={viewMode}
                  />
                ) : loadFailed ? (
                  <StateLook
                    title={`Couldn't load files: ${messageOf(listing.error)}`}
                  >
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => void listing.refetch()}
                    >
                      Try again
                    </Button>
                  </StateLook>
                ) : items.length === 0 ? (
                  searching ? (
                    <StateLook title={`No files match “${debouncedSearch}”`}>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setSearch('');
                          setDebouncedSearch('');
                        }}
                      >
                        Clear search
                      </Button>
                    </StateLook>
                  ) : folder ? (
                    <StateLook title='This folder is empty.' />
                  ) : (
                    <StateLook title='The media library is empty.' />
                  )
                ) : (
                  <>
                    <MediaItems
                      items={items}
                      mode={viewMode}
                      activePath={activePath}
                      selecting={selecting}
                      selected={selected}
                      resolveUrl={resolveUrl}
                      loadingMore={isFetchingNextPage}
                      onOpenFolder={openFolder}
                      onChoose={(path) =>
                        setActivePath((current) =>
                          current === path ? null : path
                        )
                      }
                      onToggle={toggle}
                      onFocusLast={loadMore}
                    />
                    {listing.isFetchNextPageError ? (
                      <div
                        role='alert'
                        className='mt-3 flex items-center gap-2 text-sm'
                      >
                        Couldn't load more files.
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={() => void fetchNextPage()}
                        >
                          Try again
                        </Button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}

            {activePath !== null ? (
              <MediaDetails
                key={activePath}
                path={activePath}
                resolveUrl={resolveUrl}
                canDelete={!actionsOff}
                wide={wide}
                onClose={closeDetails}
                onDelete={() => openConfirm('delete', [activePath])}
                getUrl={() => absoluteUrlsOf([activePath], resolveUrl)}
              />
            ) : null}
          </div>

          {!searching && !detailsFill && !listing.isPending && count !== '' ? (
            <p className='m-0 border-t border-border-subtle px-3 py-1.5 text-xs text-muted-foreground'>
              {count}
            </p>
          ) : null}
        </>
      )}

      {newFolder ? (
        <NewFolderForm
          existing={folders.map((item) => mediaNameOf(item.path))}
          onCreate={(name) => {
            setNewFolder(false);
            openFolder(folder ? `${folder}/${name}` : name);
          }}
          onCancel={() => setNewFolder(false)}
        />
      ) : null}
      {confirm?.kind === 'delete' ? (
        <DeleteConfirm
          paths={confirm.paths}
          resolveUrl={resolveUrl}
          onCancel={cancelConfirm}
          onOpen={openDocument}
          onConfirm={(documents) => {
            setConfirm(null);
            changes.request(
              { kind: 'delete', paths: confirm.paths },
              documents
            );
          }}
        />
      ) : null}
      {confirm?.kind === 'move' ? (
        <MoveDialog
          paths={confirm.paths}
          currentFolder={folder}
          onCancel={cancelConfirm}
          onOpen={openDocument}
          onConfirm={(target, documents) => {
            setConfirm(null);
            changes.request(
              { kind: 'move', paths: confirm.paths, folder: target },
              documents
            );
          }}
        />
      ) : null}
      {changes.dialog}
    </MediaPaneRoot>
  );
}

function MediaPaneRoot({
  rootRef,
  maximised,
  children,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
  maximised: boolean;
  children: React.ReactNode;
}) {
  return (
    <aside
      ref={rootRef}
      aria-label='Media'
      className={cn(
        'flex min-h-0 min-w-0 flex-col border-r border-border',
        maximised ? 'flex-1' : 'w-110 max-lg:flex-1'
      )}
    >
      {children}
    </aside>
  );
}
