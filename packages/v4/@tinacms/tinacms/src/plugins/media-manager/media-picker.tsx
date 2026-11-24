import { Button } from '@tinacms/ui/components/button';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { cn } from '@tinacms/ui/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { XIcon } from 'lucide-react';
import {
  type DragEvent,
  type KeyboardEvent,
  use,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { get } from 'react-hook-form';
import { authSliceOf } from '../../core/auth/slice';
import { MediaError, type MediaItem } from '../../core/media/contract';
import { useCurrentBranch } from '../../editor/content-queries';
import { FormScopeContext, TinaRuntimeContext } from '../../editor/context';
import { useFormStore } from '../../form/form-store';
import { useMediaSlice, useTinaStore } from '../../editor/hooks';
import type { MediaPickerRequest } from '../../editor/media-picker';
import {
  type UploadOrigin,
  isSameOrigin,
} from '../../editor/uploads/upload-list';
import {
  FOLDER_DROPPED,
  NOT_AN_IMAGE,
  READ_ONLY_UPLOAD,
} from '../../editor/uploads/upload-words';
import {
  uploadCheckOf,
  useFreshPaths,
  useMediaOpenMark,
  useUploadHold,
  useUploadList,
} from '../../editor/uploads/use-uploads';
import { MediaBreadcrumb } from './media-breadcrumb';
import { SESSION_EXPIRED } from './media-pane-words';
import {
  LoadFailure,
  LoadingGrid,
  MissingFileCard,
  PickerFolderCard,
  PickerImageTile,
  PickerLoading,
  SetupBanner,
} from './media-picker-parts';
import {
  CANCEL,
  CHOOSE_MANY_TITLE,
  CHOOSE_ONE_TITLE,
  CLEAR_PICKS,
  CLEAR_SEARCH,
  CLOSE_PICKER,
  DROP_OR,
  LOAD_FAILED,
  RETRY,
  SEARCH_LABEL,
  UPLOAD,
  SEARCH_PLACEHOLDER,
  confirmWords,
  emptyWords,
  forLine,
  missingCardWords,
  noHitsWords,
  pickedWords,
  resultWords,
} from './media-picker-words';
import {
  extensionOf,
  inputAcceptOf,
  mediaNameOf,
  resolveMediaAccept,
  uploadRejectionOf,
  uploadRulesOf,
} from './media-types';
import { MediaUploadButton } from './media-upload';
import {
  MEDIA_LIST_KEY,
  useMediaListing,
  useMediaStatus,
} from './use-media-listing';

const SEARCH_DEBOUNCE_MS = 300;
const IMAGE_EXTENSIONS = resolveMediaAccept('image');
const IMAGE_EXTENSION_SET: ReadonlySet<string> = new Set(IMAGE_EXTENSIONS);
const UPLOAD_RULES = uploadRulesOf(IMAGE_EXTENSIONS);

/** The folder each page load's picker last stood in. Keyed by runtime, so a new page starts at the root. */
const folderMemory = new WeakMap<object, string>();

const parentOf = (path: string): string =>
  path.split('/').slice(0, -1).join('/');

const carriesFiles = (transfer: DataTransfer): boolean =>
  transfer.types.includes('Files');

// A dropped folder arrives as a file with no bytes, so the entry is what tells them apart.
const holdsFolder = (transfer: DataTransfer): boolean =>
  Array.from(transfer.items ?? []).some(
    (item) => item.webkitGetAsEntry()?.isDirectory === true
  );

/** The live value at `address`, read from the form store's mirror of the top-level fields. */
const liveValueAt = (
  values: Readonly<Record<string, unknown>> | undefined,
  address: string
): unknown => {
  const [top = address] = address.split('.');
  return get({ [top]: values?.[top] }, address);
};

const isImagePath = (path: string): boolean =>
  IMAGE_EXTENSION_SET.has(extensionOf(path));

export interface MediaPickerPanelProps {
  request: MediaPickerRequest;
  maximised: boolean;
  /** Absent on a phone, where the picker always fills the screen. */
  onMaximise?: () => void;
  /** `restoreFocus` is true when the editor backed out, false after a confirm. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The media picker: the Media pane's folder and image looks in a panel that
 * lists images and folders only and hands the picked paths back to the field.
 */
export function MediaPickerPanel({
  request,
  maximised,
  onMaximise,
  onClose,
}: MediaPickerPanelProps) {
  const runtime = use(TinaRuntimeContext);
  const memory: object = runtime?.store ?? folderMemory;
  const media = useMediaSlice();
  const branch = useCurrentBranch() ?? '';
  const queryClient = useQueryClient();
  const uploads = useUploadList();
  const hold = useUploadHold();
  const auth = useTinaStore(authSliceOf);
  const pickerId = useId();
  useMediaOpenMark();

  const many = request.mode === 'multiple';
  const missingFolder =
    request.replacing?.missing === true
      ? parentOf(request.replacing.path)
      : null;
  const [folder, setFolder] = useState(
    () => missingFolder ?? folderMemory.get(memory) ?? ''
  );
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [picks, setPicks] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const library = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);

  const [servedMissing, setServedMissing] = useState(missingFolder);
  if (servedMissing !== missingFolder) {
    setServedMissing(missingFolder);
    if (missingFolder !== null) setFolder(missingFolder);
  }
  const scope = use(FormScopeContext);
  if (!scope) throw new Error('The media picker needs a form scope');
  const pickerSerial = useStore(scope.view, (state) => state.pickerSerial);
  const [served, setServed] = useState(pickerSerial);
  if (served !== pickerSerial) {
    setServed(pickerSerial);
    setPicks([]);
    setNotice(null);
    if (missingFolder !== null) setFolder(missingFolder);
  }
  const origin = useMemo<UploadOrigin>(
    () => ({ kind: 'picker', id: `${pickerId}:${served}` }),
    [pickerId, served]
  );

  const openFolder = (next: string) => {
    folderMemory.set(memory, next);
    setFolder(next);
  };

  const [shownFolder, setShownFolder] = useState(folder);
  if (shownFolder !== folder) {
    setShownFolder(folder);
    setSearch('');
    setDebouncedSearch('');
    setNotice(null);
  }

  const [shownHold, setShownHold] = useState(hold);
  if (shownHold !== hold) {
    setShownHold(hold);
    setNotice(null);
  }

  const leftFolder = useRef(folder);
  useEffect(() => {
    if (leftFolder.current === folder) return;
    uploads.leaveFolder(leftFolder.current);
    leftFolder.current = folder;
  }, [uploads, folder]);

  useEffect(() => {
    const next = search.trim();
    if (next === debouncedSearch) return;
    const timer = setTimeout(
      () => setDebouncedSearch(next),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // Opening a folder removes the button that had focus, so Escape would find none inside the picker.
  useEffect(() => {
    library.current?.focus({ preventScroll: true });
  }, [folder]);

  const features = media.features ?? {};
  const readOnly = features.readOnly === true;
  const serverSearch = features.search === true;
  const query = debouncedSearch.toLowerCase();

  const listing = useMediaListing(folder, {
    search: serverSearch && debouncedSearch ? debouncedSearch : undefined,
    extensions: features.extensionFilter ? IMAGE_EXTENSIONS : undefined,
  });
  const status = useMediaStatus();

  const listError = listing.isError ? listing.error : null;
  // A provider that lists a missing folder as empty looks the same as one that says not-found.
  const missingFolderGone =
    listError instanceof MediaError
      ? listError.code === 'not-found'
      : listing.isSuccess &&
        !listing.hasNextPage &&
        listing.data.pages.every((page) => page.items.length === 0);
  useEffect(() => {
    if (missingFolder !== null && folder === missingFolder && folder !== '') {
      if (missingFolderGone) setFolder('');
    }
  }, [missingFolder, folder, missingFolderGone]);

  // The form store mirrors every live value of the form, so a removal while the picker
  // is open re-renders it. `getValues` would hide the change from the compiler's memo.
  const { formId } = scope;
  const liveValues = useFormStore((state) => state.forms[formId]?.values);
  const added: ReadonlySet<string> = new Set(
    request.taken
      ? request.taken.paths(liveValueAt(liveValues, request.taken.address))
      : []
  );

  const matchesQuery = (path: string) =>
    query === '' || mediaNameOf(path).toLowerCase().includes(query);
  const freshPaths = useFreshPaths(folder);
  const uploadedPaths = new Set(
    freshPaths.filter((path) => isImagePath(path) && matchesQuery(path))
  );
  const uploadedItems: MediaItem[] = [...uploadedPaths].map((path) => ({
    path,
    kind: 'file',
  }));
  const listedItems = (listing.data?.pages.flatMap((page) => page.items) ?? [])
    .filter((item) => !uploadedPaths.has(item.path))
    .filter((item) => item.kind === 'directory' || isImagePath(item.path))
    .filter((item) => serverSearch || matchesQuery(item.path));
  const items = [...uploadedItems, ...listedItems];
  const folders = items.filter((item) => item.kind === 'directory');
  const images = items.filter((item) => item.kind === 'file');

  const { fetchNextPage, isFetchingNextPage, hasNextPage } = listing;
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinel.current;
    if (!hasNextPage || isFetchingNextPage || !node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void fetchNextPage();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const landed = useEffectEvent(
    (file: { branch: string; folder: string; path: string }) => {
      if (file.branch !== branch || file.folder !== folder) return;
      setPicks((current) => {
        if (!many) return [file.path];
        return current.includes(file.path) || added.has(file.path)
          ? current
          : [...current, file.path];
      });
      setSearch('');
      setDebouncedSearch('');
    }
  );
  useEffect(
    () =>
      uploads.onLanded((file) => {
        if (isSameOrigin(file.origin, origin)) landed(file);
      }),
    [uploads, origin]
  );

  const check = uploadCheckOf(
    (file) => uploadRejectionOf(file, UPLOAD_RULES, undefined) === null,
    features.maxSize,
    NOT_AN_IMAGE
  );
  const upload = (files: File[]) => {
    setNotice(null);
    uploads.submit({ files, folder, origin, check });
  };

  const toggle = (item: MediaItem) => {
    setPicks((current) => {
      if (current.includes(item.path)) {
        return current.filter((path) => path !== item.path);
      }
      return many ? [...current, item.path] : [item.path];
    });
  };

  const dragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!carriesFiles(event.dataTransfer)) return;
    event.preventDefault();
    if (!readOnly && hold === null) setDragging(true);
  };
  const dragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDragging(false);
  };
  const drop = (event: DragEvent<HTMLDivElement>) => {
    if (!carriesFiles(event.dataTransfer)) return;
    event.preventDefault();
    setDragging(false);
    if (readOnly) {
      setNotice(READ_ONLY_UPLOAD);
    } else if (hold !== null) {
      setNotice(hold);
    } else if (holdsFolder(event.dataTransfer)) {
      setNotice(FOLDER_DROPPED);
    } else {
      upload([...event.dataTransfer.files]);
    }
  };

  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (!(event.target instanceof Node)) return;
    if (!event.currentTarget.contains(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.target instanceof HTMLInputElement && event.target.value !== '') {
      setSearch('');
      setDebouncedSearch('');
      return;
    }
    onClose(true);
  };

  const confirm = () => {
    if (picks.length === 0) return;
    const chosen = many ? picks : picks.slice(0, 1);
    request.choose(chosen);
    onClose(false);
  };

  const title = many ? CHOOSE_MANY_TITLE : CHOOSE_ONE_TITLE;
  const hasQuery = debouncedSearch !== '';
  const retry = () => {
    void queryClient.invalidateQueries({
      queryKey: [...MEDIA_LIST_KEY, branch, folder],
    });
    void listing.refetch();
  };

  const body = () => {
    if (status.data?.kind === 'needs-setup') {
      return <SetupBanner status={status.data} />;
    }
    if (listing.isPending) return <PickerLoading folder={folder} />;
    if (listError) {
      if (
        listError instanceof MediaError &&
        listError.code === 'unauthorized'
      ) {
        const expired =
          auth !== null &&
          auth.status !== 'signed-in' &&
          auth.status !== 'forbidden';
        return (
          <LoadFailure
            message={expired ? SESSION_EXPIRED : listError.message}
            retryLabel={RETRY}
            onRetry={retry}
          />
        );
      }
      return (
        <LoadFailure message={LOAD_FAILED} retryLabel={RETRY} onRetry={retry} />
      );
    }
    return (
      <>
        {items.length === 0 && !hasNextPage ? (
          hasQuery ? (
            <div className='flex flex-col items-start gap-2 p-2 text-sm'>
              <p className='m-0 text-muted-foreground'>
                {noHitsWords(folder, debouncedSearch)}
              </p>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setSearch('');
                  setDebouncedSearch('');
                }}
              >
                {CLEAR_SEARCH}
              </Button>
            </div>
          ) : (
            <div className='flex flex-col items-start gap-2 p-2 text-sm text-muted-foreground'>
              <p className='m-0'>{emptyWords(folder)}</p>
              {readOnly ? null : (
                <>
                  <p className='m-0'>{DROP_OR}</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={hold !== null}
                    onClick={() =>
                      panel.current
                        ?.querySelector<HTMLInputElement>('input[type=file]')
                        ?.click()
                    }
                  >
                    {UPLOAD}
                  </Button>
                </>
              )}
            </div>
          )
        ) : (
          <div className='flex flex-col gap-4'>
            {folders.length > 0 ? (
              <ul
                aria-label='Folders'
                className='grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3'
              >
                {folders.map((item) => (
                  <PickerFolderCard
                    key={item.path}
                    item={item}
                    onOpen={openFolder}
                  />
                ))}
              </ul>
            ) : null}
            {images.length > 0 ? (
              <ul
                aria-label='Images'
                className='grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3'
              >
                {images.map((item) => {
                  const place = picks.indexOf(item.path);
                  return (
                    <PickerImageTile
                      key={item.path}
                      item={item}
                      number={place === -1 ? null : place + 1}
                      many={many}
                      added={added.has(item.path)}
                      isNew={uploadedPaths.has(item.path)}
                      src={media.resolveUrl(item.path, {
                        width: 400,
                        height: 400,
                      })}
                      onToggle={toggle}
                    />
                  );
                })}
              </ul>
            ) : null}
          </div>
        )}
        {hasNextPage ? (
          <div ref={sentinel} className='mt-3'>
            <LoadingGrid label='Loading more images' />
          </div>
        ) : null}
      </>
    );
  };

  return (
    <section
      ref={panel}
      role='region'
      aria-label={title}
      data-slot='media-picker'
      className='flex h-full min-h-0 flex-col overflow-hidden bg-card text-foreground'
      onKeyDown={keyDown}
    >
      <PanelHeader
        heading={title}
        action={
          readOnly ? undefined : (
            <MediaUploadButton
              accept={inputAcceptOf(UPLOAD_RULES)}
              holdReason={hold}
              size='sm'
              compact
              onPick={upload}
            />
          )
        }
        actionAt='end'
        maximised={maximised}
        onMaximise={onMaximise}
        closeLabel={CLOSE_PICKER}
        onClose={() => onClose(true)}
      />
      <p className='m-0 border-b border-border-subtle px-4 py-2 text-sm text-muted-foreground'>
        {forLine(request.forLabel, request.parentLabel)}
      </p>
      {folder === '' ? null : (
        <div className='border-b border-border-subtle px-4 py-2'>
          <MediaBreadcrumb folder={folder} onOpen={openFolder} />
        </div>
      )}
      <div className='border-b border-border-subtle px-4 py-2'>
        <SearchBox
          label={SEARCH_LABEL}
          placeholder={SEARCH_PLACEHOLDER}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => {
            setSearch('');
            setDebouncedSearch('');
          }}
          results={hasQuery ? resultWords(images.length) : undefined}
        />
      </div>
      {notice ? (
        <p
          role='alert'
          className='m-0 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive'
        >
          {notice}
        </p>
      ) : null}
      <div
        ref={library}
        role='region'
        aria-label='Media library'
        tabIndex={-1}
        data-dragging={dragging ? 'true' : undefined}
        className={cn(
          'min-h-0 min-w-0 flex-1 overflow-y-auto border-2 border-transparent p-4 outline-none transition',
          dragging ? 'rounded-sm border-orange-500' : null
        )}
        onDragEnter={dragOver}
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
      >
        {missingFolder !== null && request.replacing ? (
          <MissingFileCard
            path={request.replacing.path}
            folder={missingFolder}
            words={missingCardWords(missingFolder)}
          />
        ) : null}
        {body()}
      </div>
      <div
        data-slot='picker-footer'
        className='flex flex-none items-center gap-2 border-t border-border-subtle bg-card px-4 py-3'
      >
        <Button
          type='button'
          variant='icon'
          size='sm'
          icon={XIcon}
          disabled={picks.length === 0}
          onClick={() => setPicks([])}
        >
          {CLEAR_PICKS}
        </Button>
        <span role='status' className='min-w-0 flex-1 truncate text-sm'>
          {pickedWords(picks.length)}
        </span>
        <Button type='button' variant='outline' onClick={() => onClose(true)}>
          {CANCEL}
        </Button>
        <Button
          type='button'
          variant='primary'
          disabled={picks.length === 0}
          onClick={confirm}
        >
          {confirmWords(request.mode, picks.length)}
        </Button>
      </div>
    </section>
  );
}
