import type { QueryClient } from '@tanstack/react-query';
import { Breadcrumb } from '@tinacms/ui/components/breadcrumb';
import { Button } from '@tinacms/ui/components/button';
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
import { useKeyboardOpen } from './use-narrow';
import { toast } from '@tinacms/ui/components/toast';
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
import type { AdminRoute } from './routing';
import type { CollectionSchema } from '../core/schema/types';
import type { AdminScreen } from '../core/screen/contract';
import { folderOfDocument } from '../editor/collection-documents';
import { useCurrentBranch, useDocument } from '../editor/content-queries';
import { FormScopeContext } from '../editor/context';
import { usePreviewConnection } from '../editor/preview-connection';
import { TinaProvider } from '../editor/provider';
import { AuthGate } from './auth-gate';
import { DocumentForm } from './document-form';
import { DocumentErrorPane } from './error-summary';
import { DocumentScope } from './document-scope';
import {
  CollectionsNavigator,
  MediaPanel,
  SettingsPane,
  ToolsPane,
} from './navigator';
import { CollectionTable } from './collection-table/collection-table';
import { AdminRail, HOME_SCREEN, MEDIA_SCREEN } from './rail';
import { MediaPaneShellContext } from './media-pane-shell';
import { AdminErrorBoundary } from './error-boundary';
import { useAdminScreens, useGlobalNav, useTinaSchema } from './hooks';
import { COLLECTIONS_ROUTE, HOME_ROUTE } from './routing';
import { useBranchSync } from '../editor/branch';
import { toFormId, useHasNewDocument } from '../form/form-store';
import { UploadHost } from '../editor/uploads/upload-host';
import {
  ShellSaveProgress,
  ShellStatusBar,
  ShellTopBar,
  useLongSave,
} from './shell-bars';
import { copyPath } from './copy-path';
import { useKeptEditsNotice } from './use-kept-edits-notice';
import { useAdminRoute } from './use-admin-route';
import { useFormColumnWidth } from './use-form-column-width';
import { useUnsavedChangesGuard } from './use-unsaved-changes-guard';

const SHELL_WIDTH = { '--sidebar-width': '15rem' } as CSSProperties;

// Sits between the Top bar and the Status bar instead of the full viewport.
const BETWEEN_BARS = 'top-14 bottom-7 h-auto';

// A refused or missing clipboard says so, because the menu row promises a copy.
function copyFilePath(path: string) {
  void copyPath(path).then((copied) => {
    if (!copied) toast({ tone: 'error', title: 'Couldn’t copy the file path' });
  });
}

function Placeholder({ children }: { children: ReactNode }) {
  return <p className='p-4 text-sm text-muted-foreground'>{children}</p>;
}

function MediaPaneSlot({
  screen,
  segments,
}: {
  screen: AdminScreen;
  segments: string[];
}) {
  return <screen.component key={screen.name} segments={segments} />;
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

// Home has no panel header and no Close: there is nowhere to close to. The
// frame scrolls the screen and adds no padding, as the general outlet does.
function HomeOutlet({
  screen,
  segments,
}: {
  screen: AdminScreen | undefined;
  segments: string[];
}) {
  return (
    <SidebarInset className='min-w-0'>
      {screen ? (
        <div data-slot='home-frame' className='min-h-0 flex-1 overflow-y-auto'>
          <screen.component segments={segments} />
        </div>
      ) : (
        <Placeholder>Pick a place from the sidebar.</Placeholder>
      )}
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
  // Only objects and lists have cards to open or close.
  const expandable = (collection?.fields ?? []).some(
    (field) => field.type === 'object' || field.type === 'array'
  );

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
                <>
                  <DropdownMenuItem onClick={() => copyFilePath(openPath)}>
                    Copy file path
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!expandable}
                    onClick={() => scope?.view.getState().setExpansion(true)}
                  >
                    Expand all
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!expandable}
                    onClick={() => scope?.view.getState().setExpansion(false)}
                  >
                    Collapse all
                  </DropdownMenuItem>
                </>
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
// Toasts clear the form bar when one would sit under them.
const TOAST_OFFSET_ABOVE_BAR = { bottom: '7rem' };
// Elsewhere toasts sit 16px above the 28px Status bar.
const TOAST_OFFSET_LOW = { bottom: '44px' };
// The widest toast (the Resume prompt with its buttons inline) and the Toaster's
// right inset decide whether a toast can reach the form bar.
const TOAST_WIDEST_PX = 480;
const TOAST_RIGHT_PX = 24;
// Below the dialog layer, so a Confirm dims the toasts behind it.
const TOAST_LAYER = { zIndex: 40 };
// With the on-screen keyboard open the toast would cover the field being typed in.
const TOAST_HIDDEN = { ...TOAST_LAYER, visibility: 'hidden' } as const;

// The Toaster renders outside the shell, so it reads the form bar from the page.
function useFormBarUnderToast(): boolean {
  const [under, setUnder] = useState(false);
  useEffect(() => {
    const measure = () => {
      const bar = document.querySelector('[data-slot=form-bar]');
      setUnder(
        bar !== null &&
          bar.getBoundingClientRect().right >
            window.innerWidth - TOAST_RIGHT_PX - TOAST_WIDEST_PX
      );
    };
    const observer = new ResizeObserver(measure);
    // Collapsing the sidebar moves the form bar without resizing it, so the
    // sidebar's gap is watched too.
    let watched: (Element | null)[] = [];
    const watch = () => {
      const next = [
        document.querySelector('[data-slot=form-bar]'),
        document.querySelector('[data-slot=sidebar-gap]'),
      ];
      if (next.every((element, index) => element === watched[index])) return;
      observer.disconnect();
      watched = next;
      for (const element of next) {
        if (element) observer.observe(element);
      }
      measure();
    };
    watch();
    // The form bar mounts and unmounts with the open document.
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  return under;
}

function ShellToaster() {
  const cardShowing = useLongSave();
  const keyboardOpen = useKeyboardOpen();
  const barUnder = useFormBarUnderToast();
  const offset = cardShowing
    ? TOAST_OFFSET_ABOVE_CARD
    : barUnder
      ? TOAST_OFFSET_ABOVE_BAR
      : TOAST_OFFSET_LOW;
  return (
    <Toaster
      offset={offset}
      mobileOffset={offset}
      style={keyboardOpen ? TOAST_HIDDEN : TOAST_LAYER}
    />
  );
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
  const branch = useCurrentBranch();

  const isMediaRoute =
    route.view === 'media' ||
    (route.view === 'screen' && route.screen === MEDIA_SCREEN);

  // The main area keeps the last route that was not Media; a deep link to Media shows Home.
  const [lastMain, setLastMain] = useState<AdminRoute>(HOME_ROUTE);
  useEffect(() => {
    if (!isMediaRoute) setLastMain(route);
  }, [route, isMediaRoute]);
  const mainRoute = isMediaRoute ? lastMain : route;
  useKeptEditsNotice(mainRoute, navigate);

  const [maximised, setMaximised] = useState(false);
  useEffect(() => {
    if (!isMediaRoute) setMaximised(false);
  }, [isMediaRoute]);

  const activeCollectionName =
    mainRoute.view === 'collection' ||
    mainRoute.view === 'folder' ||
    mainRoute.view === 'document'
      ? mainRoute.collection
      : undefined;
  const collection = schema.collections.find(
    (candidate) => candidate.name === activeCollectionName
  );
  const openPath = mainRoute.view === 'document' ? mainRoute.path : undefined;
  const homeScreen = screens.find(({ name }) => name === HOME_SCREEN);
  // `#/screens/home` draws Home as `#/` does. With Home removed, it falls to
  // the general outlet, which says that no screen has that name.
  const homeSegments =
    mainRoute.view === 'home'
      ? []
      : mainRoute.view === 'screen' &&
          mainRoute.screen === HOME_SCREEN &&
          homeScreen
        ? mainRoute.segments
        : undefined;
  const activeScreen =
    mainRoute.view === 'screen' && homeSegments === undefined
      ? mainRoute
      : undefined;
  const isStaleCollectionRoute =
    activeCollectionName !== undefined && collection === undefined;

  // `get` already answers whether the open path exists — `list` only names a
  // collection's documents and would need a second, redundant query.
  const {
    entry: openEntry,
    isLoading: isLoadingOpenDocument,
    error: openDocumentError,
  } = useDocument(collection?.name, openPath);
  const holdsNewDocument = useHasNewDocument(
    openPath ? toFormId(openPath) : undefined
  );
  const isStaleDocumentRoute =
    collection !== undefined &&
    openPath !== undefined &&
    !isLoadingOpenDocument &&
    openDocumentError === null &&
    openEntry === null &&
    !holdsNewDocument;

  const goToCollections = () => navigate(COLLECTIONS_ROUTE);
  const goHome = () => navigate(HOME_ROUTE);
  const hasMediaScreen = screens.some(({ name }) => name === MEDIA_SCREEN);
  const mediaScreen = screens.find(({ name }) => name === MEDIA_SCREEN);
  const mediaSegments = route.view === 'screen' ? route.segments : [];
  const closeMedia = () => navigate(lastMain);

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
  const tableFolder =
    mainRoute.view === 'folder' && !mainRoute.side
      ? mainRoute.folder
      : mainRoute.view === 'collection' && !mainRoute.side
        ? ''
        : undefined;
  const showTable = collection !== undefined && tableFolder !== undefined;
  const mainShowsNavigator =
    mainRoute.view === 'collections' ||
    (mainRoute.view === 'collection' && !showTable) ||
    (mainRoute.view === 'folder' && !showTable) ||
    (mainRoute.view === 'document' && collection === undefined);
  const showNavigator = !isMediaRoute && mainShowsNavigator;
  const goToFolderOf = (documentPath: string) => {
    if (!collection) return goToCollections();
    const folder = folderOfDocument(collection, documentPath);
    navigate(
      folder === ''
        ? { view: 'collection', collection: collection.name }
        : { view: 'folder', collection: collection.name, folder }
    );
  };

  return (
    <SidebarProvider
      style={SHELL_WIDTH}
      className='h-svh min-h-0 flex-col overflow-hidden'
    >
      <ShellTopBar projectName={projectName} />
      <UploadHost primary />

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

        {isMediaRoute ? (
          mediaScreen ? (
            <MediaPaneShellContext
              value={{
                maximised,
                toggleMaximise: () => setMaximised((current) => !current),
                close: closeMedia,
              }}
            >
              <MediaPaneSlot screen={mediaScreen} segments={mediaSegments} />
            </MediaPaneShellContext>
          ) : (
            <MediaPanel onClose={closeMedia} />
          )
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

        <div
          className={
            isMediaRoute
              ? maximised
                ? 'hidden'
                : 'contents max-lg:hidden'
              : 'contents'
          }
        >
          {activeScreen ? (
            <ScreenOutlet
              name={activeScreen.screen}
              screen={screens.find(
                (candidate) => candidate.name === activeScreen.screen
              )}
              segments={activeScreen.segments}
              onClose={goHome}
            />
          ) : homeSegments ? (
            <HomeOutlet screen={homeScreen} segments={homeSegments} />
          ) : mainRoute.view === 'tools' || mainRoute.view === 'settings' ? (
            <SidebarInset className='min-w-0'>
              <Placeholder>Pick an entry to open it.</Placeholder>
            </SidebarInset>
          ) : isStaleCollectionRoute ? (
            <MissingPanel title='Collection not found' onClose={goHome}>
              No collection named “{activeCollectionName}”.
            </MissingPanel>
          ) : showTable ? (
            <SidebarInset className='min-w-0'>
              <div className='min-h-0 flex-1 overflow-y-auto'>
                <CollectionTable
                  key={`${branch ?? ''}/${collection.name}/${tableFolder}`}
                  collection={collection.name}
                  folder={tableFolder}
                  onClose={goHome}
                  headerAction={
                    <Button
                      variant='ghost'
                      size='sm'
                      className='max-lg:hidden'
                      onClick={() =>
                        navigate(
                          tableFolder === ''
                            ? {
                                view: 'collection',
                                collection: collection.name,
                                side: true,
                              }
                            : {
                                view: 'folder',
                                collection: collection.name,
                                folder: tableFolder,
                                side: true,
                              }
                        )
                      }
                    >
                      Restore
                    </Button>
                  }
                />
              </div>
            </SidebarInset>
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
          ) : mainShowsNavigator ? (
            <DocumentScope collection={collection} path={undefined}>
              <SidebarInset className='min-w-0'>
                <PreviewSlot preview={preview} />
              </SidebarInset>
            </DocumentScope>
          ) : (
            <DocumentScope
              collection={collection}
              path={openPath}
              onDiscardNew={() =>
                openPath ? goToFolderOf(openPath) : undefined
              }
            >
              <SidebarInset className='relative min-w-0 flex-row'>
                <FormColumn
                  openPath={openPath}
                  collection={collection}
                  onBack={() =>
                    openPath ? goToFolderOf(openPath) : goToCollections()
                  }
                />

                <DocumentErrorPane />

                <div data-preview-slot='' className='min-w-0 flex-1'>
                  <PreviewSlot preview={preview} />
                </div>
              </SidebarInset>
            </DocumentScope>
          )}
        </div>
      </div>

      <ShellStatusBar />
      <ShellSaveProgress />
    </SidebarProvider>
  );
}
