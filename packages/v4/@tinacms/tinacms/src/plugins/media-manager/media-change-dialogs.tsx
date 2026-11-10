import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { Input } from '@tinacms/ui/components/input';
import { Label } from '@tinacms/ui/components/label';
import { cn } from '@tinacms/ui/lib/utils';
import { FolderIcon, LoaderCircleIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { MediaUrlOptions } from '../../core/media/contract';
import { useSchemaCollections } from '../../editor/hooks';
import { checkerboardStyle } from './media-grid';
import { filesOf, folderNameError, subjectOf } from './media-pane-words';
import { isImage, mediaNameOf } from './media-types';
import type { MediaUse } from './media-usage';
import { useMediaListing } from './use-media-listing';
import { useMediaUsage } from './use-media-usage';

type ResolveUrl = (path: string, options?: MediaUrlOptions) => string;

export interface OpenableUse extends MediaUse {
  collection: string;
  documentPath: string;
}

const nameOf = (title: string) => title.split('/').at(-1) ?? title;

const titleOf = (use: MediaUse) =>
  use.mine ? `${nameOf(use.title)} (your unsaved edits)` : nameOf(use.title);

function UseCard({
  use,
  onOpen,
}: {
  use: MediaUse;
  onOpen: (use: OpenableUse) => void;
}) {
  const collections = useSchemaCollections();
  const documentPath = use.documentPath ?? use.title;
  const collection =
    use.collection ??
    collections.find(
      ({ path }) => path !== undefined && documentPath.startsWith(`${path}/`)
    )?.name;
  return (
    <li className='flex items-center gap-2 rounded-sm border border-border-subtle px-2.5 py-1.5'>
      <div className='min-w-0 flex-1'>
        <p className='m-0 truncate text-sm font-medium'>{titleOf(use)}</p>
        <p className='m-0 truncate text-xs text-muted-foreground'>
          {documentPath}
        </p>
      </div>
      {collection !== undefined ? (
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => onOpen({ ...use, collection, documentPath })}
        >
          Open
          <span className='sr-only'> {titleOf(use)}</span>
        </Button>
      ) : null}
    </li>
  );
}

/** What the editor needs to know before a change: which documents use the files, or that nobody could check. */
export function UsageSummary({
  paths,
  onOpen,
  onCount,
}: {
  paths: readonly string[];
  onOpen: (use: OpenableUse) => void;
  onCount?: (documents: number, checking: boolean) => void;
}) {
  const usage = useMediaUsage(paths, true);
  const many = paths.length > 1;
  const checking = usage.isPending;
  const uses = usage.data?.uses ?? new Map<string, MediaUse[]>();
  const searched = usage.data?.searched === true;
  const used = paths.filter((path) => (uses.get(path)?.length ?? 0) > 0);
  const documents = new Set(
    used.flatMap((path) =>
      (uses.get(path) ?? []).map((use) => use.documentPath)
    )
  ).size;
  const reportCount = useRef(onCount);
  reportCount.current = onCount;
  useEffect(() => {
    reportCount.current?.(documents, checking);
  }, [documents, checking]);

  if (checking) {
    return (
      <p className='m-0 flex items-center gap-2 text-sm text-muted-foreground'>
        <Icon glyph={LoaderCircleIcon} size={16} className='animate-spin' />
        {many
          ? 'Checking where these files are used'
          : 'Checking where this file is used'}
      </p>
    );
  }

  let summary: string;
  if (!searched) {
    summary = many
      ? "Couldn't check where these files are used. Any document that uses them will show a missing image."
      : "Couldn't check where this file is used. Any document that uses it will show a missing image.";
  } else if (used.length === 0) {
    summary = many
      ? "Search found no saved document using these files. A document search can't see may still use them, and would show a missing image."
      : "Search found no saved document using this file. A document search can't see may still use it, and would show a missing image.";
  } else if (many) {
    summary = `${used.length === paths.length ? `All ${paths.length}` : `${used.length} of ${paths.length}`} files are used in documents, which will show a missing image:`;
  } else {
    summary = `Used in ${documents} ${documents === 1 ? 'document' : 'documents'}, which will show a missing image:`;
  }
  const unused = paths.length - used.length;

  return (
    <div className='flex flex-col gap-2'>
      <p className='m-0 text-sm'>{summary}</p>
      {used.length > 0 ? (
        many ? (
          used.map((path) => (
            <section key={path} aria-label={mediaNameOf(path)}>
              <h3 className='m-0 mb-1 text-xs font-semibold'>
                {mediaNameOf(path)}
              </h3>
              <ul className='m-0 flex list-none flex-col gap-1.5 p-0'>
                {(uses.get(path) ?? []).map((use) => (
                  <UseCard
                    key={use.documentPath ?? use.title}
                    use={use}
                    onOpen={onOpen}
                  />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <ul className='m-0 flex list-none flex-col gap-1.5 p-0'>
            {(uses.get(used[0] ?? '') ?? []).map((use) => (
              <UseCard
                key={use.documentPath ?? use.title}
                use={use}
                onOpen={onOpen}
              />
            ))}
          </ul>
        )
      ) : null}
      {many && searched && used.length > 0 && unused > 0 ? (
        <p className='m-0 text-sm text-muted-foreground'>
          No use was found for the other {unused}.
        </p>
      ) : null}
    </div>
  );
}

function Thumbnail({
  path,
  resolveUrl,
}: {
  path: string;
  resolveUrl: ResolveUrl;
}) {
  const name = mediaNameOf(path);
  return isImage(name) ? (
    <img
      src={resolveUrl(path, { width: 64, height: 48 })}
      alt=''
      className='h-12 w-16 shrink-0 rounded-sm object-cover'
      style={checkerboardStyle}
    />
  ) : null;
}

/** The delete confirm. Usage warns and never blocks. */
export function DeleteConfirm({
  paths,
  resolveUrl,
  onConfirm,
  onCancel,
  onOpen,
}: {
  paths: readonly string[];
  resolveUrl: ResolveUrl;
  onConfirm: (documents: number) => void;
  onCancel: () => void;
  onOpen: (use: OpenableUse) => void;
}) {
  const [{ documents, checking }, setCount] = useState({
    documents: 0,
    checking: true,
  });
  const [only] = paths;
  const many = paths.length > 1;
  const title =
    !many && only !== undefined
      ? `Delete “${mediaNameOf(only)}”?`
      : `Delete ${filesOf(paths.length)}?`;
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='flex items-center gap-3'>
            {!many && only !== undefined ? (
              <Thumbnail path={only} resolveUrl={resolveUrl} />
            ) : null}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription render={<div />}>
            <UsageSummary
              paths={paths}
              onOpen={onOpen}
              onCount={(next, busy) =>
                setCount({ documents: next, checking: busy })
              }
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className='m-0 text-xs text-muted-foreground'>
          {documents > 0 ? 'Opening a document cancels this delete. ' : ''}
          Deleted files can't be brought back from here.
        </p>
        <AlertDialogFooter>
          <Button type='button' variant='ghost' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            disabled={checking}
            onClick={() => onConfirm(documents)}
          >
            {many ? `Delete ${filesOf(paths.length)}` : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Folders only, with a trail and the root. The current folder cannot be chosen. */
export function MoveDialog({
  paths,
  currentFolder,
  onConfirm,
  onCancel,
  onOpen,
}: {
  paths: readonly string[];
  currentFolder: string;
  onConfirm: (folder: string, documents: number) => void;
  onCancel: () => void;
  onOpen: (use: OpenableUse) => void;
}) {
  const [browsing, setBrowsing] = useState(currentFolder);
  const [documents, setDocuments] = useState(0);
  const listing = useMediaListing(browsing);
  const folders = (
    listing.data?.pages.flatMap((page) => page.items) ?? []
  ).filter((item) => item.kind === 'directory');
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = listing;
  useEffect(() => {
    if (folders.length === 0 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [folders.length, hasNextPage, isFetchingNextPage, fetchNextPage]);
  const parts = browsing ? browsing.split('/') : [];
  const trail = ['Media', ...parts];
  const here = browsing === currentFolder;

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move {subjectOf(paths)}</AlertDialogTitle>
          <AlertDialogDescription render={<div />}>
            <UsageSummary
              paths={paths}
              onOpen={onOpen}
              onCount={(next) => setDocuments(next)}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <nav
          aria-label='Move to'
          className='flex flex-wrap items-center gap-1 text-sm'
        >
          {trail.map((label, index) => (
            <span key={`${index}:${label}`} className='flex items-center gap-1'>
              {index > 0 ? <span aria-hidden='true'>/</span> : null}
              {index < trail.length - 1 ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setBrowsing(parts.slice(0, index).join('/'))}
                >
                  {label}
                </Button>
              ) : (
                <span aria-current='page' className='font-medium'>
                  {label}
                </span>
              )}
            </span>
          ))}
        </nav>
        <ul
          aria-label='Folders'
          className={cn(
            'm-0 flex max-h-48 list-none flex-col gap-0.5 overflow-y-auto p-0'
          )}
          onScroll={(event) => {
            const list = event.currentTarget;
            if (
              hasNextPage &&
              !isFetchingNextPage &&
              list.scrollHeight - list.scrollTop - list.clientHeight < 120
            ) {
              void fetchNextPage();
            }
          }}
        >
          {listing.isPending ? (
            <li className='p-2 text-sm text-muted-foreground'>
              Loading folders
            </li>
          ) : folders.length === 0 ? (
            <li className='p-2 text-sm text-muted-foreground'>
              No folders here.
            </li>
          ) : (
            folders.map((folder) => (
              <li key={folder.path}>
                <button
                  type='button'
                  className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted'
                  onClick={() => setBrowsing(folder.path)}
                >
                  <Icon glyph={FolderIcon} size={16} />
                  {mediaNameOf(folder.path)}
                </button>
              </li>
            ))
          )}
        </ul>
        <p className='m-0 text-xs text-muted-foreground'>
          Documents that store the old path are not changed.
        </p>
        <AlertDialogFooter>
          <Button type='button' variant='ghost' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type='button'
            variant='primary'
            disabled={here}
            onClick={() => onConfirm(browsing, documents)}
          >
            Move here
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** New folder: refuses a bad name with the reason under the field. */
export function NewFolderForm({
  existing,
  onCreate,
  onCancel,
}: {
  existing: readonly string[];
  onCreate: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [tried, setTried] = useState(false);
  const error = folderNameError(name, existing);
  const inputId = useId();
  const errorId = useId();
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <form
          className='flex flex-col gap-4'
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setTried(true);
            if (error === null) onCreate(name.trim());
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>New folder</AlertDialogTitle>
            <AlertDialogDescription>
              If you leave the folder before you upload a file to it, the folder
              disappears.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex flex-col gap-2'>
            <Label htmlFor={inputId}>Folder name</Label>
            <Input
              id={inputId}
              value={name}
              autoComplete='off'
              aria-invalid={tried && error !== null ? true : undefined}
              aria-describedby={tried && error !== null ? errorId : undefined}
              onChange={(event) => setName(event.target.value)}
            />
            {tried && error !== null ? (
              <p
                id={errorId}
                role='alert'
                className='m-0 text-sm text-destructive'
              >
                {error}
              </p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <Button type='button' variant='ghost' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' variant='primary'>
              Create
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
