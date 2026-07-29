// The shell of the admin UI: the collection list, then the document list, then the form.
// The compiled schema drives all of it. No code here names a collection or a field type.
// Add a collection to tina/config.ts, and it appears. This is what ADR-016 §1 means when
// it says that the schema fans out to the forms.
//
// There are three panes. The Sidebar of @tinacms/ui holds the navigation, the form sits
// beside it, and the preview comes last. Navigation and editing are separate tasks. The
// sidebar collapses, so the editor can use the width.

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

/**
 * Wider than the default of 16rem. The entries are file paths, and a list of truncated
 * paths has little value.
 */
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

/**
 * The document list of one collection.
 *
 * This is a separate component, because the documents load through the content
 * capability at the mount. A hook higher in the tree would load every collection, and
 * not the open one alone.
 */
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
  // A read that failed and a collection that is empty are different answers, and the
  // editor has to be able to tell them apart. Before the query client, a failed list
  // reached console.error and the sidebar said "No documents yet."
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
          {/* The status sits inside the button, and not in SidebarMenuBadge. That
              slot has an absolute position for a count, and this status is words. */}
          <SidebarMenuButton
            isActive={path === activePath}
            onClick={() =>
              navigate({ view: 'document', collection: collection.name, path })
            }
          >
            <span className='flex-1 truncate'>{documentName(path)}</span>
            {/* The badge reads the store, so a document that was edited and left
                still reads as unsaved after its form unmounts (ADR-012). */}
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
            // Navigating to a screen from the sidebar enters it at its root. The
            // segments below that belong to the screen, and only the screen knows how
            // to build one.
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

/**
 * The registered view for a `screen` route, rendered where the form and the preview
 * otherwise sit. A screen owns the whole pane. A screen is not a collection, so the
 * document form beside it would have nothing to edit.
 */
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
          // Keyed on the name, so moving between two screens remounts rather than
          // handing the next screen the last one's state.
          <screen.component key={screen.name} segments={segments} />
        ) : (
          // A route naming a screen no plugin registered is stale, the same way a
          // route naming a collection outside the schema is.
          <Placeholder>No screen named “{name}”.</Placeholder>
        )}
      </div>
    </SidebarInset>
  );
}

/**
 * The host of the preview, beside the form.
 *
 * This tests the form scope, and not the route. On a deep link, the two differ for one
 * frame, because the route is known before the document loads. A preview mounted in that
 * gap would read a form that does not exist yet.
 */
function PreviewSlot({ preview }: { preview?: ReactNode }) {
  if (!use(FormScopeContext)) {
    return <Placeholder>Select a document to edit.</Placeholder>;
  }
  return <>{preview ?? <Placeholder>No preview configured.</Placeholder>}</>;
}

/**
 * What the form column shows while the next document's fields build in a transition.
 * It stands where the fields will, so the column neither collapses nor jumps.
 */
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

/**
 * An aside inside the main region. It supports the preview, which holds the work, so it
 * opens narrow. A form column that grows with the window is hard to read.
 *
 * Narrow is the default, and not the limit. The rich-text toolbar sizes itself to this
 * column and hides the tools it cannot fit, so an editor who works in prose can drag the
 * column wider and keep them. The rich-text e2e tests cover the default width, which is
 * also the floor.
 */
function FormColumn({ openPath }: { openPath?: string }) {
  const { width, isResizing, handleProps } = useFormColumnWidth();
  const scope = use(FormScopeContext);
  const seedKey = scope?.seedKey;

  // The mount of the fields is deferred behind a transition. Building the rich-text
  // editor is the most expensive render in the admin, and it grows with the document —
  // long prose froze the whole shell for most of a second when it rendered in the
  // urgent pass. The urgent pass now commits the skeleton below, which also unmounts
  // the outgoing editor at once: nothing stale is left focusable while the reset and
  // the build are in flight. The transition then renders the fields concurrently, so
  // the main thread keeps yielding to input and to the preview until they are ready.
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
          /* Keyed on the seed key, and not on the path. Plate reads its value at mount
             only, and the seed key advances when the provider's reset lands, so the
             fields mount once, on the new document's values. The key stays here. On the
             FormProvider above it remounted the preview iframe on every switch. */
          <DocumentForm key={seedKey} />
        ) : (
          <FormColumnSkeleton />
        )}
      </aside>

      {/* The grab area is wider than the line it draws, because a 1px target is a miss
          more often than a hit. */}
      <div
        className='-ml-1 z-10 w-2 shrink-0 cursor-col-resize touch-none select-none focus-visible:outline-none'
        {...handleProps}
      />

      {/* Pointer capture keeps the drag events coming, but the pointer still travels over
          the form and the preview. This holds the resize cursor over both, and stops the
          drag from selecting their text. */}
      {isResizing ? (
        <div className='fixed inset-0 z-50 cursor-col-resize' />
      ) : null}
    </>
  );
}

export interface TinaAdminProps {
  /**
   * This renders beside the editor. It is the site preview, in a host that has one.
   *
   * It is a prop, and not a UI slot. The set of slot names is a first-party set that
   * the core has not defined yet (ADR-013), and a name invented here would prejudge it.
   */
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
  /**
   * A route that names a collection outside the schema is stale, and not broken. The
   * sidebar says so, instead of a screen that looks correct.
   */
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

          {/* The group is absent when no plugin registered a screen, so an admin with
              no screen plugins looks exactly as it did before they existed. */}
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

      {/* A screen replaces the editor panes rather than sitting beside them, so the two
          branches swap here. That unmounts the form scope, which is right: a screen is
          not a document, and there is nothing for the form to edit. The unsaved edits
          survive it — the form store keeps a form after its scope goes (ADR-012), so
          returning to the document finds them again. */}
      {activeScreen ? (
        <ScreenOutlet
          name={activeScreen.screen}
          screen={screens.find(
            (candidate) => candidate.name === activeScreen.screen
          )}
          segments={activeScreen.segments}
        />
      ) : (
        /* The scope wraps the two panes that read the open form, and not the whole
           shell. A swap at this position rebuilds them, which is right — both are
           created and destroyed with the document anyway — while the SidebarProvider
           and the navigation above keep their state. Wrapping the whole layout reset
           the sidebar and re-fetched the document list on every open and close. */
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
