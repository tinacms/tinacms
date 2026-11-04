import { EmptyState } from '@tinacms/ui/components/empty-state';
import { NavRow } from '@tinacms/ui/components/nav-row';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { useEffect, useState } from 'react';
import type { CollectionSchema } from '../core/schema/types';
import { useCollectionDocuments } from '../editor/content-queries';
import { toFormId, useIsFormDirty } from '../form/form-store';
import type { AdminRoute } from './routing';

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
  const unsaved = useIsFormDirty(toFormId(path));
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
  missingCollection,
  onClose,
}: {
  collections: CollectionSchema[];
  /** The document row to mark, when no document is open. */
  selectedPath?: string;
  route: AdminRoute;
  navigate: (route: AdminRoute) => void;
  missingCollection?: string;
  onClose: () => void;
}) {
  const activeCollection =
    route.view === 'collection' || route.view === 'document'
      ? route.collection
      : undefined;
  const activePath = route.view === 'document' ? route.path : selectedPath;
  return (
    <aside
      aria-label='Navigator'
      className='flex w-110 min-w-0 shrink-0 flex-col border-r border-border'
    >
      <PanelHeader heading='Collections' closeLabel='Close' onClose={onClose} />
      <div className='min-h-0 flex-1 overflow-y-auto p-2'>
        {missingCollection ? (
          <p className='px-2 py-1.5 text-sm text-muted-foreground'>
            No collection named “{missingCollection}”.
          </p>
        ) : null}
        {collections.length === 0 ? (
          <EmptyState text='No collections yet.' />
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
}: {
  hasLibrary: boolean;
  open: boolean;
  navigate: (route: AdminRoute) => void;
  onClose: () => void;
}) {
  return (
    <aside
      aria-label='Media panel'
      className='flex w-110 min-w-0 shrink-0 flex-col border-r border-border'
    >
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
