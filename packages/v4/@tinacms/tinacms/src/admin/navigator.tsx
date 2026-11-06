import { EmptyState } from '@tinacms/ui/components/empty-state';
import { NavRow } from '@tinacms/ui/components/nav-row';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { useEffect, useState } from 'react';
import type { CollectionSchema } from '../core/schema/types';
import { useCollectionDocuments } from '../editor/content-queries';
import { toFormId, useUnsavedFormIds } from '../form/form-store';
import type { GlobalNavEntry } from '../core/slot/contract';
import { DropdownMenuItem } from '@tinacms/ui/components/dropdown-menu';
import { openNavTarget } from './rail';
import type { AdminRoute } from './routing';

const paneClass = (hideBelowLg: boolean) =>
  `flex w-110 min-w-0 flex-col border-r border-border${hideBelowLg ? ' max-lg:hidden' : ''}`;

const documentName = (path: string) => path.split('/').at(-1) ?? path;

function DocumentRow({
  collection,
  path,
  selected,
  navigate,
}: {
  collection: string;
  path: string;
  selected: boolean;
  navigate: (route: AdminRoute) => void;
}) {
  const unsaved = useUnsavedFormIds().includes(toFormId(path));
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

function CollectionDocuments({
  collection,
  activePath,
  navigate,
}: {
  collection: CollectionSchema;
  activePath?: string;
  navigate: (route: AdminRoute) => void;
}) {
  const { documents, isLoading, error } = useCollectionDocuments(
    collection.name
  );
  const label = collection.label ?? collection.name;
  if (error) {
    return (
      <p role='alert' className='py-1.5 pl-8 text-sm text-destructive'>
        Could not load {label}. {error.message}
      </p>
    );
  }
  if (isLoading) {
    return (
      <p className='py-1.5 pl-8 text-sm text-muted-foreground'>Loading…</p>
    );
  }
  if (documents.length === 0) {
    return (
      <p className='py-1.5 pl-8 text-sm text-muted-foreground'>
        No documents yet.
      </p>
    );
  }
  return (
    <ul aria-label={`${label} documents`} className='m-0 list-none p-0 pl-4.5'>
      {documents.map(({ path }) => (
        <DocumentRow
          key={path}
          collection={collection.name}
          path={path}
          selected={path === activePath}
          navigate={navigate}
        />
      ))}
    </ul>
  );
}

// Review N unsaved: only the documents that hold edits, open or kept in a stored draft, grouped by collection.
function UnsavedCollection({
  collection,
  navigate,
}: {
  collection: CollectionSchema;
  navigate: (route: AdminRoute) => void;
}) {
  const { documents, error } = useCollectionDocuments(collection.name);
  const dirty = new Set<string>(useUnsavedFormIds());
  const unsaved = documents.filter(({ path }) => dirty.has(path));
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
            navigate={navigate}
          />
        ))}
      </ul>
    </li>
  );
}

function CollectionNode({
  collection,
  active,
  activePath,
  navigate,
}: {
  collection: CollectionSchema;
  active: boolean;
  activePath?: string;
  navigate: (route: AdminRoute) => void;
}) {
  const [open, setOpen] = useState(active);
  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);
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
        <CollectionDocuments
          collection={collection}
          activePath={activePath}
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
  hideBelowLg = false,
}: {
  collections: CollectionSchema[];
  /** The document row to mark, when no document is open. */
  selectedPath?: string;
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
  onClose: () => void;
  hideBelowLg?: boolean;
}) {
  const activeCollection =
    route.view === 'collection' || route.view === 'document'
      ? route.collection
      : undefined;
  const activePath = route.view === 'document' ? route.path : selectedPath;
  const unsavedOnly =
    route.view === 'collections' && route.unsavedOnly === true;
  const hasUnsaved = useUnsavedFormIds().length > 0;
  return (
    <aside aria-label='Navigator' className={paneClass(hideBelowLg)}>
      <PanelHeader
        heading='Collections'
        closeLabel='Close'
        onClose={onClose}
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
          <ul aria-label='Unsaved documents' className='m-0 list-none p-0'>
            {collections.map((collection) => (
              <UnsavedCollection
                key={collection.name}
                collection={collection}
                navigate={navigate}
              />
            ))}
          </ul>
        ) : (
          <ul aria-label='Collections' className='m-0 list-none p-0'>
            {collections.map((collection) => (
              <CollectionNode
                key={collection.name}
                collection={collection}
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

/** The panel the Media entry opens beside the rail. The library itself fills the main area. */
export function MediaPanel({
  hasLibrary,
  open,
  navigate,
  onClose,
  hideBelowLg = false,
}: {
  hasLibrary: boolean;
  open: boolean;
  navigate: (route: AdminRoute) => void;
  onClose: () => void;
  hideBelowLg?: boolean;
}) {
  return (
    <aside aria-label='Media panel' className={paneClass(hideBelowLg)}>
      <PanelHeader heading='Media' closeLabel='Close' onClose={onClose} />
      <div className='min-h-0 flex-1 overflow-y-auto p-2'>
        {hasLibrary ? (
          <NavRow
            kind='doc'
            icon='media'
            selected={open}
            aria-current={open ? 'page' : undefined}
            onClick={() =>
              navigate({ view: 'screen', screen: 'media', segments: [] })
            }
          >
            Media library
          </NavRow>
        ) : (
          <EmptyState text='No media library is installed.' />
        )}
      </div>
    </aside>
  );
}

/** The panel the Tools entry opens beside the rail: every plugin entry that has no group. */
export function ToolsPane({
  entries,
  activeScreen,
  navigate,
  onClose,
  hideBelowLg = false,
}: {
  entries: GlobalNavEntry[];
  activeScreen?: string;
  navigate: (route: AdminRoute) => void;
  onClose: () => void;
  hideBelowLg?: boolean;
}) {
  return (
    <aside aria-label='Tools panel' className={paneClass(hideBelowLg)}>
      <PanelHeader heading='Tools' closeLabel='Close' onClose={onClose} />
      <div className='min-h-0 flex-1 overflow-y-auto p-2'>
        {entries.length === 0 ? (
          <EmptyState text='No tools installed.' />
        ) : (
          <ul aria-label='Tools' className='m-0 list-none p-0'>
            {entries.map(({ label, icon, target }, index) => {
              const selected =
                target.kind === 'screen' && target.screen === activeScreen;
              return (
                <li key={`${index}:${label}`}>
                  <NavRow
                    kind='doc'
                    icon={icon}
                    external={target.kind === 'url'}
                    selected={selected}
                    aria-current={selected ? 'page' : undefined}
                    render={
                      target.kind === 'url' ? (
                        <a
                          href={target.href}
                          target='_blank'
                          rel='noopener noreferrer'
                        />
                      ) : undefined
                    }
                    onClick={() => openNavTarget(target, navigate)}
                  >
                    {label}
                  </NavRow>
                </li>
              );
            })}
          </ul>
        )}
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
