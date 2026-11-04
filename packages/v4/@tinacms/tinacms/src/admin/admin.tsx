import type { QueryClient } from '@tanstack/react-query';
import { Breadcrumb } from '@tinacms/ui/components/breadcrumb';
import { DropdownMenuItem } from '@tinacms/ui/components/dropdown-menu';
import { PanelHeader } from '@tinacms/ui/components/panel-header';
import { TooltipProvider } from '@tinacms/ui/components/tooltip';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@tinacms/ui/components/sidebar';
import { Skeleton } from '@tinacms/ui/components/skeleton';
import { Toaster } from '@tinacms/ui/components/sonner';
import { Tabs, TabsPanel } from '@tinacms/ui/components/tabs';
import {
  type CSSProperties,
  type ReactNode,
  startTransition,
  use,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HashRouter } from 'react-router-dom';
import type { ResolvedConfig } from '../config';
import type { CollectionSchema } from '../core/schema/types';
import type { AdminScreen } from '../core/screen/contract';
import { useDocument } from '../editor/content-queries';
import { FormScopeContext } from '../editor/context';
import { usePreviewConnection } from '../editor/preview-connection';
import { TinaProvider } from '../editor/provider';
import { AuthGate } from './auth-gate';
import { DocumentForm } from './document-form';
import { DocumentScope } from './document-scope';
import {
  CollectionsNavigator,
  MediaPanel,
  SettingsPane,
  ToolsPane,
} from './navigator';
import { AdminRail, MEDIA_SCREEN } from './rail';
import { AdminErrorBoundary } from './error-boundary';
import { useAdminScreens, useGlobalNav, useTinaSchema } from './hooks';
import { COLLECTIONS_ROUTE, HOME_ROUTE } from './routing';
import { useBranchSync } from '../editor/branch';
import {
  ShellSaveProgress,
  ShellStatusBar,
  ShellTopBar,
  useLongSave,
} from './shell-bars';
import { useAdminRoute } from './use-admin-route';
import { useFormColumnWidth } from './use-form-column-width';
import { useUnsavedChangesGuard } from './use-unsaved-changes-guard';

const SHELL_WIDTH = { '--sidebar-width': '15rem' } as CSSProperties;

// Sits between the Top bar and the Status bar instead of the full viewport.
const BETWEEN_BARS = 'top-11 bottom-7 h-auto';

function Placeholder({ children }: { children: ReactNode }) {
  return <p className='p-4 text-sm text-muted-foreground'>{children}</p>;
}

function ScreenOutlet({
  name,
  screen,
  segments,
  onClose,
}: {
  name: string;
  screen: AdminScreen | undefined;
  segments: string[];
  onClose: () => void;
}) {
  return (
    <SidebarInset className='min-w-0'>
      <PanelHeader
        heading={screen?.label ?? name}
        closeLabel='Close'
        onClose={onClose}
      />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {screen ? (
          <screen.component key={screen.name} segments={segments} />
        ) : (
          <Placeholder>No screen named “{name}”.</Placeholder>
        )}
      </div>
    </SidebarInset>
  );
}

function PreviewFrame({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  usePreviewConnection(iframeRef);
  return (
    <iframe
      ref={iframeRef}
      src={src}
      title='Preview'
      className='size-full border-none'
    />
  );
}

// The page being previewed: the document's place and, for a preview URL, the URL.
function PreviewHeader({ url }: { url?: string }) {
  const scope = use(FormScopeContext);
  if (!scope) return null;
  const collectionLabel = scope.collection.label ?? scope.collection.name;
  return (
    <div className='flex h-11 flex-none items-center gap-3 border-b border-border-subtle bg-card pr-4 pl-2'>
      <Breadcrumb
        size='sm'
        aria-label='Preview location'
        items={[
          { label: collectionLabel },
          { label: scope.path.split('/').at(-1) ?? scope.path },
        ]}
      />
      {url ? (
        <span className='ml-auto min-w-0 truncate font-mono text-xs text-muted-foreground'>
          {url}
        </span>
      ) : null}
    </div>
  );
}

function PreviewSlot({ preview }: { preview?: ReactNode }) {
  if (!use(FormScopeContext)) {
    return <Placeholder>Select a document to edit.</Placeholder>;
  }
  const url = typeof preview === 'string' ? preview : undefined;
  return (
    <div className='flex size-full min-h-0 flex-col'>
      <PreviewHeader url={url} />
      <div className='min-h-0 flex-1'>
        {url !== undefined ? (
          <PreviewFrame src={url} />
        ) : (
          (preview ?? <Placeholder>No preview configured.</Placeholder>)
        )}
      </div>
    </div>
  );
}

// Only the views that have content show. Fields is the one view today.
const FORM_TABS = [{ value: 'fields', label: 'Fields' }] as const;

function FormColumnSkeleton() {
  return (
    <div role='status' aria-label='Loading document' className='space-y-4'>
      <Skeleton className='w-2/3' />
      <Skeleton shape='block' className='h-8' />
      <Skeleton className='w-1/3' />
      <Skeleton shape='block' className='h-40' />
    </div>
  );
}

function FormColumn({
  openPath,
  collection,
  onBack,
}: {
  openPath?: string;
  collection?: CollectionSchema;
  onBack: () => void;
}) {
  const { width, isResizing, handleProps } = useFormColumnWidth();
  const scope = use(FormScopeContext);
  const seedKey = scope?.seedKey;

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
        aria-label='Document form'
        className='flex min-w-0 shrink-0 flex-col overflow-hidden border-r border-border'
        style={{ width }}
      >
        {collection ? (
          <PanelHeader
            backLabel='Return to navigator'
            backTitle={`Back to ${collection.label ?? collection.name}`}
            onBack={onBack}
            menuLabel='Document menu'
            menu={
              openPath === undefined ? undefined : (
                <DropdownMenuItem
                  onClick={() => void navigator.clipboard?.writeText(openPath)}
                >
                  Copy file path
                </DropdownMenuItem>
              )
            }
          />
        ) : (
          <PanelHeader heading='Document' />
        )}
        <Tabs
          tabs={FORM_TABS}
          aria-label='Document views'
          className='min-h-0 flex-1'
        >
          <TabsPanel value='fields' className='flex min-h-0 flex-1 flex-col'>
            {openPath === undefined ? (
              <p className='p-4 text-sm text-muted-foreground'>
                Select a document to edit
              </p>
            ) : null}
            {mountedSeedKey === seedKey ? (
              <DocumentForm key={seedKey} />
            ) : (
              <div className='p-4'>
                <FormColumnSkeleton />
              </div>
            )}
          </TabsPanel>
        </Tabs>
      </aside>

      <div
        className='-ml-1 z-10 w-2 shrink-0 cursor-col-resize touch-none select-none focus-visible:outline-none'
        {...handleProps}
      />

      {isResizing ? (
        <div className='fixed inset-0 z-50 cursor-col-resize' />
      ) : null}
    </>
  );
}

export interface TinaAdminProps {
  config: ResolvedConfig;
  preview?: ReactNode;
  queryClient?: QueryClient;
}

export function TinaAdmin({ config, preview, queryClient }: TinaAdminProps) {
  return (
    <AdminErrorBoundary>
      <TinaProvider config={config} queryClient={queryClient}>
        <TooltipProvider>
          <HashRouter>
            <AuthGate>
              <AdminShell preview={preview} projectName={config.projectName} />
            </AuthGate>
          </HashRouter>
          <ShellToaster />
        </TooltipProvider>
      </TinaProvider>
    </AdminErrorBoundary>
  );
}

// Toasts sit above the Save progress card while it shows.
const TOAST_OFFSET_ABOVE_CARD = { bottom: '8rem' };

function ShellToaster() {
  const cardShowing = useLongSave();
  return <Toaster offset={cardShowing ? TOAST_OFFSET_ABOVE_CARD : undefined} />;
}

function MissingPanel({
  title,
  onClose,
  hideBelowLg = false,
  children,
}: {
  title: string;
  onClose: () => void;
  hideBelowLg?: boolean;
  children: ReactNode;
}) {
  return (
    <SidebarInset className={hideBelowLg ? 'min-w-0 max-lg:hidden' : 'min-w-0'}>
      <PanelHeader heading={title} closeLabel='Close' onClose={onClose} />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <Placeholder>{children}</Placeholder>
      </div>
    </SidebarInset>
  );
}

function AdminShell({
  preview,
  projectName,
}: {
  preview?: ReactNode;
  projectName?: string;
}) {
  useUnsavedChangesGuard();
  useBranchSync();
  const schema = useTinaSchema();
  const screens = useAdminScreens();
  const globalNav = useGlobalNav();
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
  const isStaleCollectionRoute =
    activeCollectionName !== undefined && collection === undefined;

  // `get` already answers whether the open path exists — `list` only names a
  // collection's documents and would need a second, redundant query.
  const {
    entry: openEntry,
    isLoading: isLoadingOpenDocument,
    error: openDocumentError,
  } = useDocument(collection?.name, openPath);
  const isStaleDocumentRoute =
    collection !== undefined &&
    openPath !== undefined &&
    !isLoadingOpenDocument &&
    openDocumentError === null &&
    openEntry === null;

  const goToCollections = () => navigate(COLLECTIONS_ROUTE);
  const goHome = () => navigate(HOME_ROUTE);
  const hasMediaScreen = screens.some(({ name }) => name === MEDIA_SCREEN);
  const showMediaPanel =
    route.view === 'media' ||
    (route.view === 'screen' && route.screen === MEDIA_SCREEN);

  // The navigator keeps the last opened document selected after Back.
  const [lastOpen, setLastOpen] = useState<{
    collection: string;
    path: string;
  } | null>(null);
  useEffect(() => {
    if (route.view === 'document') {
      setLastOpen({ collection: route.collection, path: route.path });
    }
  }, [route]);
  const selectedPath =
    openPath ??
    (lastOpen && lastOpen.collection === activeCollectionName
      ? lastOpen.path
      : undefined);
  const showNavigator =
    route.view === 'collections' ||
    route.view === 'collection' ||
    (route.view === 'document' && collection === undefined);

  return (
    <SidebarProvider
      style={SHELL_WIDTH}
      className='h-svh min-h-0 flex-col overflow-hidden'
    >
      <ShellTopBar projectName={projectName} />

      <div className='flex min-h-0 flex-1'>
        <Sidebar
          aria-label='Content'
          role='navigation'
          collapsible='icon'
          className={BETWEEN_BARS}
        >
          <AdminRail
            route={route}
            navigate={navigate}
            sections={globalNav}
            hasMediaScreen={hasMediaScreen}
          />
        </Sidebar>

        {showMediaPanel ? (
          <MediaPanel
            hasLibrary={hasMediaScreen}
            open={route.view === 'screen'}
            navigate={navigate}
            onClose={goHome}
            hideBelowLg={route.view === 'screen'}
          />
        ) : null}

        {showNavigator ? (
          <CollectionsNavigator
            collections={schema.collections}
            selectedPath={selectedPath}
            route={route}
            navigate={navigate}
            onClose={goHome}
            hideBelowLg={isStaleCollectionRoute}
          />
        ) : null}

        {route.view === 'tools' ? <ToolsPane onClose={goHome} /> : null}

        {route.view === 'settings' ? <SettingsPane onClose={goHome} /> : null}

        {activeScreen ? (
          <ScreenOutlet
            name={activeScreen.screen}
            screen={screens.find(
              (candidate) => candidate.name === activeScreen.screen
            )}
            segments={activeScreen.segments}
            onClose={goHome}
          />
        ) : route.view === 'home' ? (
          <MissingPanel title='Home' onClose={goHome}>
            Pick a collection to start editing.
          </MissingPanel>
        ) : route.view === 'media' ? (
          <MissingPanel title='Media' onClose={goHome} hideBelowLg>
            {hasMediaScreen
              ? 'Pick a file from the Media panel.'
              : 'Nothing to show here yet.'}
          </MissingPanel>
        ) : route.view === 'tools' || route.view === 'settings' ? (
          <SidebarInset className='min-w-0'>
            <Placeholder>Pick an entry to open it.</Placeholder>
          </SidebarInset>
        ) : isStaleCollectionRoute ? (
          <MissingPanel title='Collection not found' onClose={goHome}>
            No collection named “{activeCollectionName}”.
          </MissingPanel>
        ) : isStaleDocumentRoute ? (
          <MissingPanel title='Document not found' onClose={goHome}>
            No document named “{openPath}”.
          </MissingPanel>
        ) : openPath !== undefined && openDocumentError !== null ? (
          <MissingPanel title='Cannot open document' onClose={goHome}>
            <span role='alert'>
              Cannot read “{openPath}”. {openDocumentError.message}
            </span>
          </MissingPanel>
        ) : showNavigator ? (
          <DocumentScope collection={collection} path={undefined}>
            <SidebarInset className='min-w-0'>
              <PreviewSlot preview={preview} />
            </SidebarInset>
          </DocumentScope>
        ) : (
          <DocumentScope collection={collection} path={openPath}>
            <SidebarInset className='min-w-0 flex-row'>
              <FormColumn
                openPath={openPath}
                collection={collection}
                onBack={() =>
                  collection
                    ? navigate({
                        view: 'collection',
                        collection: collection.name,
                      })
                    : goToCollections()
                }
              />

              <div className='min-w-0 flex-1'>
                <PreviewSlot preview={preview} />
              </div>
            </SidebarInset>
          </DocumentScope>
        )}
      </div>

      <ShellStatusBar />
      <ShellSaveProgress />
    </SidebarProvider>
  );
}
