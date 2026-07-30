// The admin shell. The compiled schema drives all of it: no code here names a
// collection or a field type (ADR-016 §1).

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@tinacms/ui/components/sidebar';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import {
  type CSSProperties,
  type ReactNode,
  startTransition,
  use,
  useEffect,
  useState,
} from 'react';
import type { CollectionSchema } from '../core/schema/types';
import type { AdminScreen } from '../core/screen/contract';
import { useCollectionDocuments } from '../editor/content-queries';
import { FormScopeContext } from '../editor/context';
import { toFormId } from '../form/form-store';
import { DocumentForm } from './document-form';
import { DocumentScope } from './document-scope';
import { FormStatusBadge } from './document-status';
import { useAdminScreens, useTinaSchema } from './hooks';
import { type AdminRoute, COLLECTIONS_ROUTE } from './routing';
import { useAdminRoute } from './use-admin-route';
import { useFormColumnWidth } from './use-form-column-width';

// Wider than the 16rem default: the entries are file paths.
const SHELL_WIDTH = { '--sidebar-width': '18rem' } as CSSProperties;

const documentName = (path: string) => path.split('/').at(-1) ?? path;

function Placeholder({ children }: { children: ReactNode }) {
  return <p className='p-4 text-sm text-muted-foreground'>{children}</p>;
}

function CollectionMenu({
  collections,
  activeName,
  navigate,
}: {
  collections: CollectionSchema[];
  activeName?: string;
  navigate: (route: AdminRoute) => void;
}) {
  return (
    <SidebarMenu aria-label='Collections'>
      {collections.map((collection) => (
        <SidebarMenuItem key={collection.name}>
          <SidebarMenuButton
            isActive={collection.name === activeName}
            onClick={() =>
              navigate({ view: 'collection', collection: collection.name })
            }
          >
            {collection.label ?? collection.name}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// Separate component: a hook higher in the tree would load every collection.
function DocumentMenu({
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
  // A failed read and an empty collection are different answers.
  if (error) {
    return (
      <p className='px-2 py-1.5 text-sm text-destructive'>
        Could not load {label}. {error.message}
      </p>
    );
  }
  if (isLoading) {
    return (
      <p className='px-2 py-1.5 text-sm text-muted-foreground'>Loading…</p>
    );
  }
  if (documents.length === 0) {
    return (
      <p className='px-2 py-1.5 text-sm text-muted-foreground'>
        No documents yet.
      </p>
    );
  }
  return (
    <SidebarMenu aria-label={`${label} documents`}>
      {documents.map(({ path }) => (
        <SidebarMenuItem key={path}>
          <SidebarMenuButton
            isActive={path === activePath}
            onClick={() =>
              navigate({ view: 'document', collection: collection.name, path })
            }
          >
            <span className='flex-1 truncate'>{documentName(path)}</span>
            <FormStatusBadge formId={toFormId(path)} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function ScreenMenu({
  screens,
  activeName,
  navigate,
}: {
  screens: AdminScreen[];
  activeName?: string;
  navigate: (route: AdminRoute) => void;
}) {
  return (
    <SidebarMenu aria-label='Screens'>
      {screens.map((screen) => (
        <SidebarMenuItem key={screen.name}>
          <SidebarMenuButton
            isActive={screen.name === activeName}
            onClick={() =>
              navigate({ view: 'screen', screen: screen.name, segments: [] })
            }
          >
            {screen.label}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function ScreenOutlet({
  name,
  screen,
  segments,
}: {
  name: string;
  screen: AdminScreen | undefined;
  segments: string[];
}) {
  return (
    <SidebarInset>
      <div className='flex items-center gap-1 p-4 pb-2'>
        <SidebarTrigger />
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {screen ? (
          // Keyed so moving between screens remounts.
          <screen.component key={screen.name} segments={segments} />
        ) : (
          <Placeholder>No screen named “{name}”.</Placeholder>
        )}
      </div>
    </SidebarInset>
  );
}

// Tests the form scope, not the route: on a deep link the two differ for one
// frame, and a preview mounted in that gap would read a form that does not
// exist yet.
function PreviewSlot({ preview }: { preview?: ReactNode }) {
  if (!use(FormScopeContext)) {
    return <Placeholder>Select a document to edit.</Placeholder>;
  }
  return <>{preview ?? <Placeholder>No preview configured.</Placeholder>}</>;
}

function FormColumnSkeleton() {
  return (
    <div role='status' aria-label='Loading document' className='space-y-4'>
      <Skeleton className='h-5 w-2/3' />
      <Skeleton className='h-8 w-full' />
      <Skeleton className='h-5 w-1/3' />
      <Skeleton className='h-40 w-full' />
    </div>
  );
}

function FormColumn({ openPath }: { openPath?: string }) {
  const { width, isResizing, handleProps } = useFormColumnWidth();
  const scope = use(FormScopeContext);
  const seedKey = scope?.seedKey;

  // The field mount is deferred behind a transition: building the rich-text
  // editor is the most expensive render in the admin, and long prose froze the
  // shell for most of a second in the urgent pass. The urgent pass commits the
  // skeleton, which also unmounts the outgoing editor at once.
  const [mountedSeedKey, setMountedSeedKey] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (mountedSeedKey === seedKey) return;
    startTransition(() => setMountedSeedKey(seedKey));
  }, [seedKey, mountedSeedKey]);

  return (
    <>
      <aside
        className='flex min-w-0 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border p-4'
        style={{ width }}
      >
        <div className='mb-2 flex items-center gap-1'>
          <SidebarTrigger />
          {openPath === undefined ? (
            <span className='text-sm text-muted-foreground'>
              Select a document to edit
            </span>
          ) : null}
        </div>
        {mountedSeedKey === seedKey ? (
          /* Keyed on the seed key: Plate reads its value at mount only. The key
             stays here — on FormProvider it remounted the preview iframe on
             every switch. */
          <DocumentForm key={seedKey} />
        ) : (
          <FormColumnSkeleton />
        )}
      </aside>

      {/* Grab area wider than the line it draws: a 1px target is a miss. */}
      <div
        className='-ml-1 z-10 w-2 shrink-0 cursor-col-resize touch-none select-none focus-visible:outline-none'
        {...handleProps}
      />

      {/* Holds the resize cursor over the panes and stops the drag selecting
          their text. */}
      {isResizing ? (
        <div className='fixed inset-0 z-50 cursor-col-resize' />
      ) : null}
    </>
  );
}

export interface TinaAdminProps {
  // The site preview. A prop, not a UI slot: the slot names are a first-party
  // set the core has not defined yet (ADR-013).
  preview?: ReactNode;
}

export function TinaAdmin({ preview }: TinaAdminProps) {
  const schema = useTinaSchema();
  const screens = useAdminScreens();
  const { route, navigate } = useAdminRoute();

  const activeCollectionName =
    route.view === 'collection' || route.view === 'document'
      ? route.collection
      : undefined;
  const collection = schema.collections.find(
    (candidate) => candidate.name === activeCollectionName
  );
  const openPath = route.view === 'document' ? route.path : undefined;
  const activeScreen = route.view === 'screen' ? route : undefined;
  // A route naming a collection outside the schema is stale, not broken.
  const isStaleCollectionRoute =
    activeCollectionName !== undefined && collection === undefined;

  const layout = (
    <SidebarProvider style={SHELL_WIDTH}>
      <Sidebar aria-label='Content' role='navigation'>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate(COLLECTIONS_ROUTE)}>
                <span className='text-xs font-semibold tracking-wide uppercase'>
                  TinaCMS
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Collections</SidebarGroupLabel>
            <CollectionMenu
              collections={schema.collections}
              activeName={collection?.name}
              navigate={navigate}
            />
          </SidebarGroup>

          {isStaleCollectionRoute ? (
            <Placeholder>
              No collection named “{activeCollectionName}”.
            </Placeholder>
          ) : null}

          {collection ? (
            <SidebarGroup>
              <SidebarGroupLabel>
                {collection.label ?? collection.name}
              </SidebarGroupLabel>
              <DocumentMenu
                collection={collection}
                activePath={openPath}
                navigate={navigate}
              />
            </SidebarGroup>
          ) : null}

          {screens.length > 0 ? (
            <SidebarGroup>
              <SidebarGroupLabel>Screens</SidebarGroupLabel>
              <ScreenMenu
                screens={screens}
                activeName={activeScreen?.screen}
                navigate={navigate}
              />
            </SidebarGroup>
          ) : null}
        </SidebarContent>
      </Sidebar>

      {/* A screen replaces the editor panes. That unmounts the form scope, but
          unsaved edits survive it: the store keeps a form after its scope goes
          (ADR-012). */}
      {activeScreen ? (
        <ScreenOutlet
          name={activeScreen.screen}
          screen={screens.find(
            (candidate) => candidate.name === activeScreen.screen
          )}
          segments={activeScreen.segments}
        />
      ) : (
        /* The scope wraps only the panes that read the open form: wrapping the
           whole layout reset the sidebar and re-fetched the document list on
           every open and close. */
        <DocumentScope collection={collection} path={openPath}>
          <SidebarInset className='flex-row'>
            <FormColumn openPath={openPath} />

            <div className='min-w-0 flex-1'>
              <PreviewSlot preview={preview} />
            </div>
          </SidebarInset>
        </DocumentScope>
      )}
    </SidebarProvider>
  );

  return layout;
}
