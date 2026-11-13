import { EmptyState } from '@tinacms/ui/components/empty-state';
import { Button } from '@tinacms/ui/components/button';
import { NavRow } from '@tinacms/ui/components/nav-row';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { useEffect, useRef, useState } from 'react';
import type { CollectionSchema } from '../core/schema/types';
import {
  useCollectionDocuments,
  useCollectionsDocumentPaths,
} from '../editor/content-queries';
import {
  carryOpenFolders,
  foldersThrough,
  useCollectionLevel,
} from '../editor/collection-tree';
import type { FolderSummary } from '../core/content/contract';
import {
  useFormStore,
  useNewDocumentIds,
  useUnsavedFormIds,
} from '../form/form-store';
import { isUnder } from '../core/content/names';
import {
  directoryOf,
  folderOfDocument,
  useNewDocumentDrafts,
} from '../editor/collection-documents';
import type { GlobalNavEntry } from '../core/slot/contract';
import { DropdownMenuItem } from '@tinacms/ui/components/dropdown-menu';
import { DiscardConfirm } from './discard-confirm';
import { openNavTarget } from './rail';
import type { AdminRoute } from './routing';

const paneClass = (hideBelowLg: boolean) =>
  `flex w-110 min-w-0 flex-col border-r border-border${hideBelowLg ? ' max-lg:hidden' : ''}`;

const documentName = (path: string) => path.split('/').at(-1) ?? path;

function DocumentRow({
  collection,
  path,
  selected,
  unsaved,
  navigate,
}: {
  collection: string;
  path: string;
  selected: boolean;
  unsaved: boolean;
  navigate: (route: AdminRoute) => void;
}) {
  return (
    <li>
      <NavRow
        kind='doc'
        nested
        selected={selected}
        aria-current={selected ? 'page' : undefined}
        unsaved={unsaved}
        unsavedLook='badge'
        title={path}
        onClick={() => navigate({ view: 'document', collection, path })}
      >
        {documentName(path)}
      </NavRow>
    </li>
  );
}

type OpenFolders = ReadonlySet<string>;
type SetOpenFolders = (update: (open: OpenFolders) => OpenFolders) => void;

interface LevelProps {
  collection: CollectionSchema;
  folder: string;
  activePath?: string;
  unsavedIds: ReadonlySet<string>;
  navigate: (route: AdminRoute) => void;
  openFolders: OpenFolders;
  setOpenFolders: SetOpenFolders;
}

function FolderRow({
  folder,
  ...level
}: Omit<LevelProps, 'folder'> & { folder: FolderSummary }) {
  const open = level.openFolders.has(folder.path);
  return (
    <li>
      <NavRow
        kind='folder'
        open={open}
        title={folder.path}
        onClick={() =>
          level.setOpenFolders((current) => {
            const next = new Set(current);
            if (open) next.delete(folder.path);
            else next.add(folder.path);
            return next;
          })
        }
      >
        {folder.name}
      </NavRow>
      {open ? <CollectionLevel {...level} folder={folder.path} /> : null}
    </li>
  );
}

function CollectionLevel(props: LevelProps) {
  const { collection, folder, activePath, unsavedIds, navigate } = props;
  const { folders, documents, isLoading, error, refetch, loaded } =
    useCollectionLevel(collection.name, folder);
  const drafts = useNewDocumentDrafts(collection.name, folder).filter(
    ({ path }) => !documents.some((document) => document.path === path)
  );
  const seenFolders = useRef<FolderSummary[] | null>(null);
  const { setOpenFolders } = props;
  useEffect(() => {
    if (!loaded) return;
    const before = seenFolders.current;
    seenFolders.current = folders;
    if (before === null || before === folders) return;
    setOpenFolders((open) => carryOpenFolders(open, before, folders));
  }, [loaded, folders, setOpenFolders]);

  const label = collection.label ?? collection.name;
  if (error) {
    return (
      <div className='py-1.5 pl-8'>
        <p role='alert' className='text-sm text-destructive'>
          {error.message}
        </p>
        <Button size='sm' onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }
  if (isLoading) {
    return (
      <p className='py-1.5 pl-8 text-sm text-muted-foreground'>Loading…</p>
    );
  }
  if (folders.length + drafts.length + documents.length === 0) {
    return (
      <p className='py-1.5 pl-8 text-sm text-muted-foreground'>
        No documents yet.
      </p>
    );
  }
  const listLabel =
    folder === '' ? label : (folder.split('/').at(-1) ?? folder);
  return (
    <ul
      aria-label={`${listLabel} documents`}
      className='m-0 list-none p-0 pl-4.5'
    >
      {folders.map((entry) => (
        <FolderRow key={entry.path} {...props} folder={entry} />
      ))}
      {drafts.map(({ path }) => (
        <DocumentRow
          key={path}
          collection={collection.name}
          path={path}
          selected={path === activePath}
          unsaved
          navigate={navigate}
        />
      ))}
      {documents.map(({ path }) => (
        <DocumentRow
          key={path}
          collection={collection.name}
          path={path}
          selected={path === activePath}
          unsaved={unsavedIds.has(path)}
          navigate={navigate}
        />
      ))}
    </ul>
  );
}

// Review N unsaved: only the documents that hold edits, open or kept in a stored draft, grouped by collection.
function UnsavedCollection({
  collection,
  unsavedIds,
  navigate,
}: {
  collection: CollectionSchema;
  unsavedIds: ReadonlySet<string>;
  navigate: (route: AdminRoute) => void;
}) {
  const { documents, error } = useCollectionDocuments(collection.name);
  const directory = directoryOf(collection, '');
  const created = useNewDocumentIds().filter((id) => isUnder(id, directory));
  const unsaved = [
    ...documents.filter(({ path }) => unsavedIds.has(path)),
    ...created
      .filter((id) => !documents.some(({ path }) => path === id))
      .map((id) => ({ path: id })),
  ];
  const label = collection.label ?? collection.name;
  if (error) {
    return (
      <li>
        <p role='alert' className='px-2 py-1.5 text-sm text-destructive'>
          Could not load {label}. {error.message}
        </p>
      </li>
    );
  }
  if (unsaved.length === 0) return null;
  return (
    <li>
      <NavRow kind='group' open>
        {label}
      </NavRow>
      <ul
        aria-label={`${label} unsaved documents`}
        className='m-0 list-none p-0 pl-4.5'
      >
        {unsaved.map(({ path }) => (
          <DocumentRow
            key={path}
            collection={collection.name}
            path={path}
            selected={false}
            unsaved
            navigate={navigate}
          />
        ))}
      </ul>
    </li>
  );
}

// Edits kept in the browser for a file that is no longer listed have no row to open.
// Each gets a line that says so and a way to throw the edits away.
function MissingDocumentEdits({
  collections,
}: {
  collections: CollectionSchema[];
}) {
  const { paths, settled } = useCollectionsDocumentPaths(
    collections.map(({ name }) => name)
  );
  const discard = useFormStore((state) => state.discardStoredDraft);
  const [confirming, setConfirming] = useState<string | null>(null);
  const created = new Set<string>(useNewDocumentIds());
  const missing = useUnsavedFormIds().filter(
    (id) => !paths.has(id) && !created.has(id)
  );
  if (!settled || missing.length === 0) return null;
  return (
    <ul
      aria-label='Edits for documents that are gone'
      className='m-0 mt-2 list-none p-0'
    >
      {missing.map((id) => (
        <li key={id} className='flex items-center gap-2 px-2 py-1.5 text-sm'>
          <span className='min-w-0 flex-1'>
            <span className='block truncate' title={id}>
              {documentName(id)}
            </span>
            <span className='text-muted-foreground'>
              Its file was not found. The edits are still kept here.
            </span>
          </span>
          <Button
            size='sm'
            variant='destructive'
            aria-label={`Discard edits to ${documentName(id)}`}
            onClick={() => setConfirming(id)}
          >
            Discard
          </Button>
        </li>
      ))}
      <DiscardConfirm
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) setConfirming(null);
        }}
        onConfirm={() => {
          const id = missing.find((entry) => entry === confirming);
          if (id) discard(id);
        }}
        title={`Discard unsaved edits to “${confirming}”?`}
        description='The file is gone, so these edits are the only copy. Discarded edits can’t be brought back.'
      />
    </ul>
  );
}

function CollectionNode({
  collection,
  active,
  activePath,
  unsavedIds,
  navigate,
}: {
  collection: CollectionSchema;
  active: boolean;
  activePath?: string;
  unsavedIds: ReadonlySet<string>;
  navigate: (route: AdminRoute) => void;
}) {
  const [open, setOpen] = useState(active);
  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);
  const selectedFolders =
    active && activePath
      ? foldersThrough(folderOfDocument(collection, activePath))
      : [];
  const selectedKey = selectedFolders.join('\n');
  const [openFolders, setOpenFolders] = useState<OpenFolders>(
    () => new Set(selectedFolders)
  );
  useEffect(() => {
    if (selectedKey === '') return;
    setOpenFolders((current) => {
      const missing = selectedKey
        .split('\n')
        .filter((path) => !current.has(path));
      return missing.length === 0 ? current : new Set([...current, ...missing]);
    });
  }, [selectedKey]);
  const label = collection.label ?? collection.name;
  return (
    <li>
      <NavRow
        kind='group'
        open={open}
        onClick={() => {
          if (open && active) {
            setOpen(false);
            return;
          }
          setOpen(true);
          navigate({ view: 'collection', collection: collection.name });
        }}
      >
        {label}
      </NavRow>
      {open ? (
        <CollectionLevel
          collection={collection}
          folder=''
          openFolders={openFolders}
          setOpenFolders={setOpenFolders}
          activePath={activePath}
          unsavedIds={unsavedIds}
          navigate={navigate}
        />
      ) : null}
    </li>
  );
}

/**
 * The panel the Collections entry opens beside the rail: every collection as a
 * group, its documents under it. The Unsaved tag marks a document row here.
 */
export function CollectionsNavigator({
  collections,
  selectedPath,
  route,
  navigate,
  onClose,
  onMaximise,
  hideBelowLg = false,
}: {
  collections: CollectionSchema[];
  /** The document row to mark, when no document is open. */
  selectedPath?: string;
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
  onClose: () => void;
  onMaximise: () => void;
  hideBelowLg?: boolean;
}) {
  const activeCollection =
    route.view === 'collection' ||
    route.view === 'folder' ||
    route.view === 'document'
      ? route.collection
      : undefined;
  const activePath = route.view === 'document' ? route.path : selectedPath;
  const unsavedOnly =
    route.view === 'collections' && route.unsavedOnly === true;
  const unsavedIds = new Set<string>(useUnsavedFormIds());
  const hasUnsaved = unsavedIds.size > 0;
  return (
    <aside aria-label='Navigator' className={paneClass(hideBelowLg)}>
      <PanelHeader
        heading='Collections'
        closeLabel='Close'
        onClose={onClose}
        onMaximise={onMaximise}
        menuLabel='Collections menu'
        menu={
          <DropdownMenuItem
            onClick={() =>
              navigate({ view: 'collections', unsavedOnly: !unsavedOnly })
            }
          >
            {unsavedOnly ? 'Show all documents' : 'Show unsaved only'}
          </DropdownMenuItem>
        }
      />
      <div className='min-h-0 flex-1 overflow-y-auto p-2'>
        {collections.length === 0 ? (
          <EmptyState text='No collections yet.' />
        ) : unsavedOnly && !hasUnsaved ? (
          <EmptyState text='No unsaved documents.' />
        ) : unsavedOnly ? (
          <>
            <ul aria-label='Unsaved documents' className='m-0 list-none p-0'>
              {collections.map((collection) => (
                <UnsavedCollection
                  key={collection.name}
                  collection={collection}
                  unsavedIds={unsavedIds}
                  navigate={navigate}
                />
              ))}
            </ul>
            <MissingDocumentEdits collections={collections} />
          </>
        ) : (
          <ul aria-label='Collections' className='m-0 list-none p-0'>
            {collections.map((collection) => (
              <CollectionNode
                key={collection.name}
                collection={collection}
                unsavedIds={unsavedIds}
                active={collection.name === activeCollection}
                activePath={activePath}
                navigate={navigate}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

/** The Media pane when no media plugin is installed. */
export function MediaPanel({
  onClose,
  hideBelowLg = false,
}: {
  onClose: () => void;
  hideBelowLg?: boolean;
}) {
  return (
    <aside aria-label='Media' className={paneClass(hideBelowLg)}>
      <PanelHeader heading='Media' closeLabel='Close' onClose={onClose} />
      <div className='min-h-0 flex-1 overflow-y-auto p-2'>
        <EmptyState text='No media library is installed.' />
      </div>
    </aside>
  );
}

/** The panel the Tools entry opens beside the rail. Plugin entries sit in the rail (ADR-027), so it has none yet. */
export function ToolsPane({ onClose }: { onClose: () => void }) {
  return (
    <aside aria-label='Tools panel' className={paneClass(false)}>
      <PanelHeader heading='Tools' closeLabel='Close' onClose={onClose} />
      <div className='min-h-0 flex-1 overflow-y-auto p-2'>
        <EmptyState text='No tools installed.' />
      </div>
    </aside>
  );
}

/** The panel the Settings entry opens beside the rail. Plugins have no way to add to it yet. */
export function SettingsPane({ onClose }: { onClose: () => void }) {
  return (
    <aside
      aria-label='Settings panel'
      className='flex w-110 min-w-0 flex-col border-r border-border'
    >
      <PanelHeader heading='Settings' closeLabel='Close' onClose={onClose} />
      <div className='min-h-0 flex-1 overflow-y-auto p-2'>
        <EmptyState text='No settings yet.' />
      </div>
    </aside>
  );
}
