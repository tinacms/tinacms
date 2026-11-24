import type { QueryClient } from '@tanstack/react-query';
import type { BreadcrumbStep } from '@tinacms/ui/components/breadcrumb';
import { EmptyState } from '@tinacms/ui/components/empty-state';
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
import { cn } from '@tinacms/ui/lib/utils';
import { useKeyboardOpen } from '@tinacms/ui/hooks/use-keyboard-open';
import { useNoFieldZoom } from './use-no-field-zoom';
import { toast } from '@tinacms/ui/components/toast';
import {
  type CSSProperties,
  type ReactNode,
  startTransition,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { HashRouter } from 'react-router-dom';
import type { ResolvedConfig } from '../config';
import type { AdminRoute } from './routing';
import { FormScopeContext, type FormScope } from '../editor/context';
import type { CollectionSchema } from '../core/schema/types';
import type { AdminScreen } from '../core/screen/contract';
import { folderOfDocument } from '../editor/collection-documents';
import { useCurrentBranch, useDocument } from '../editor/content-queries';
import type { DocumentRef, ReferenceStep } from '../editor/preview-connection';
import { toFormId, useFormStore, useHasNewDocument } from '../form/form-store';
import { documentTitle } from './document-title';
import { TinaProvider } from '../editor/provider';
import { AuthGate } from './auth-gate';
import { DocumentForm, useLevelTrail } from './document-form';
import { DocumentErrorPane } from './error-summary';
import { DocumentScope } from './document-scope';
import { CollectionsNavigator, MediaPanel, useTreeFolders } from './navigator';
import { CollectionTable } from './collection-table/collection-table';
import { CollectionsIndex } from './collections-index/collections-index';
import { AdminRail, HOME_SCREEN, MEDIA_SCREEN } from './rail';
import { MediaPaneShellContext } from './media-pane-shell';
import { AdminErrorBoundary } from './error-boundary';
import { useAdminScreens, useGlobalNav, useTinaSchema } from './hooks';
import { COLLECTIONS_ROUTE, HOME_ROUTE } from './routing';
import { useBranchSync } from '../editor/branch';
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
import type { PreviewConnectionOptions } from '../editor/preview-connection';
import {
  DESKTOP_FORM_COLUMN,
  NAVIGATOR_COLUMN,
  TABLET_FORM_COLUMN,
  useColumnWidth,
} from './use-form-column-width';
import { type DocumentView, OneViewContext } from './one-view';
import { Button } from '@tinacms/ui/components/button';
import { NoPreview, PreviewSlot } from './preview-slot';
import { useTier } from '@tinacms/ui/hooks/use-tier';
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

function PreviewNodeSlot({ preview }: { preview?: ReactNode }) {
  const hasForm = use(FormScopeContext) !== null;
  return (
    <div data-preview-slot='' className='min-w-0 flex-1'>
      {hasForm ? (
        (preview ?? <NoPreview />)
      ) : (
        <Placeholder>Select a document to edit.</Placeholder>
      )}
    </div>
  );
}

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

function FormColumnFrame({
  children,
  hidden = false,
}: {
  children: ReactNode;
  hidden?: boolean;
}) {
  const tier = useTier();
  const oneView = use(OneViewContext).active;
  const { width, isResizing, handleProps } = useColumnWidth(
    tier === 'desktop' ? DESKTOP_FORM_COLUMN : TABLET_FORM_COLUMN
  );
  // One view and a hidden column keep the form mounted: the frame stays in the page, its
  // box does not draw.
  return (
    <>
      <aside
        aria-label='Document form'
        data-form-column=''
        className={cn(
          'flex min-w-0 shrink-0 flex-col overflow-hidden border-r border-border',
          hidden ? 'hidden' : oneView ? 'contents' : null
        )}
        style={oneView || hidden ? undefined : { width }}
      >
        {children}
      </aside>

      <div
        className={cn(
          'relative -ml-1 z-10 w-2 shrink-0 cursor-col-resize touch-none select-none focus-visible:outline-none touch:after:absolute touch:after:inset-y-0 touch:after:-inset-x-4 touch:after:content-[""]',
          (hidden || oneView) && 'hidden'
        )}
        {...handleProps}
      />

      {isResizing ? (
        <div className='fixed inset-0 z-50 cursor-col-resize' />
      ) : null}
    </>
  );
}

/** The Collections column beside the preview: fixed at desktop, dragged on a tablet, full width on a phone. */
function NavigatorFrame({
  children,
  hidden = false,
}: {
  children: ReactNode;
  hidden?: boolean;
}) {
  const tier = useTier();
  const { width, isResizing, handleProps } = useColumnWidth({
    ...NAVIGATOR_COLUMN,
    // The handle's own label.
  });
  return (
    <>
      <div
        className={cn(
          'flex min-w-0 shrink-0',
          tier === 'desktop' ? 'w-110' : null,
          tier === 'phone' ? 'flex-1' : null,
          hidden && 'below-desktop:hidden'
        )}
        style={tier === 'tablet' ? { width } : undefined}
      >
        {children}
      </div>
      <div
        {...handleProps}
        aria-label='Resize the Collections column'
        className={cn(
          'relative -ml-1 z-10 w-2 shrink-0 cursor-col-resize touch-none select-none focus-visible:outline-none touch:after:absolute touch:after:inset-y-0 touch:after:-inset-x-4 touch:after:content-[""]',
          tier !== 'tablet' && 'hidden'
        )}
      />
      {isResizing ? (
        <div className='fixed inset-0 z-50 cursor-col-resize' />
      ) : null}
    </>
  );
}

/** Where Back from a document lands: the table of the folder that holds it. */
const folderRouteOf = (
  collection: CollectionSchema,
  documentPath: string | undefined
): AdminRoute => {
  const folder =
    documentPath === undefined
      ? ''
      : folderOfDocument(collection, documentPath);
  return folder === ''
    ? { view: 'collection', collection: collection.name, maximised: true }
    : { view: 'folder', collection: collection.name, folder };
};

const collectionLabel = (collection: CollectionSchema) =>
  collection.label ?? collection.name;

function FormHead({
  openPath,
  collection,
  collections,
  step,
  navigate,
}: {
  openPath: string | undefined;
  collection: CollectionSchema;
  collections: CollectionSchema[];
  step: ReferenceStep | null;
  navigate: (route: AdminRoute) => void;
}) {
  const scope = use(FormScopeContext);
  const values = useFormStore((state) =>
    scope ? state.forms[scope.formId]?.values : undefined
  );
  const fromValues = useFormStore((state) =>
    step ? state.forms[toFormId(step.from.path)]?.values : undefined
  );
  const expandable = collection.fields.some(
    (field) => field.type === 'object' || field.type === 'array'
  );
  const trailCollection =
    (step && collections.find((c) => c.name === step.from.collection)) ||
    collection;
  const base: BreadcrumbStep[] = [
    { label: 'Collections', onClick: () => navigate(COLLECTIONS_ROUTE) },
    {
      label: collectionLabel(trailCollection),
      onClick: () =>
        navigate(
          folderRouteOf(trailCollection, step ? step.from.path : openPath)
        ),
    },
    ...(step
      ? [
          {
            label: documentTitle(step.from.path, fromValues),
            onClick: () =>
              navigate({
                view: 'document',
                collection: step.from.collection,
                path: step.from.path,
              }),
          },
        ]
      : []),
  ];
  return scope ? (
    <ScopedFormHead
      scope={scope}
      base={base}
      title={documentTitle(openPath ?? '', values)}
      expandable={expandable}
      openPath={openPath}
    />
  ) : (
    <PanelHeader
      trail={base}
      heading={openPath ? documentTitle(openPath, undefined) : 'Document'}
    />
  );
}

function ScopedFormHead({
  scope,
  base,
  title,
  expandable,
  openPath,
}: {
  scope: FormScope;
  base: BreadcrumbStep[];
  title: string;
  expandable: boolean;
  openPath: string | undefined;
}) {
  const levels = useLevelTrail(scope);
  const oneView = use(OneViewContext);
  const trail =
    levels.heading === null
      ? base
      : [
          ...base,
          {
            label: title,
            onClick: levels.closeAll,
            invalid: levels.documentInvalid,
          },
          ...levels.parents,
        ];
  return (
    <PanelHeader
      data-form-part='head'
      trail={trail}
      heading={levels.heading ?? title}
      maximised={oneView.active}
      onMaximise={
        oneView.canMaximise ? () => oneView.toggleMaximise('form') : undefined
      }
      maximiseLabels={['Maximise form', 'Restore form']}
      menuLabel='Form actions'
      menu={
        openPath === undefined ? undefined : (
          <>
            <DropdownMenuItem onClick={() => copyFilePath(openPath)}>
              Copy file path
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!expandable}
              onClick={() => scope.view.getState().setExpansion(true)}
            >
              Expand all
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!expandable}
              onClick={() => scope.view.getState().setExpansion(false)}
            >
              Collapse all
            </DropdownMenuItem>
          </>
        )
      }
    />
  );
}

function FormColumn({
  openPath,
  collection,
  collections,
  step,
  navigate,
  hidden = false,
}: {
  hidden?: boolean;
  openPath?: string;
  collection?: CollectionSchema;
  collections: CollectionSchema[];
  step: ReferenceStep | null;
  navigate: (route: AdminRoute) => void;
}) {
  const scope = use(FormScopeContext);
  const seedKey = scope?.seedKey;

  const [mountedSeedKey, setMountedSeedKey] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (mountedSeedKey === seedKey) return;
    startTransition(() => setMountedSeedKey(seedKey));
  }, [seedKey, mountedSeedKey]);

  const oneView = use(OneViewContext).active;
  return (
    <FormColumnFrame hidden={hidden}>
      {collection ? (
        <FormHead
          openPath={openPath}
          collection={collection}
          collections={collections}
          step={step}
          navigate={navigate}
        />
      ) : (
        <PanelHeader heading='Document' />
      )}
      <div className={oneView ? 'contents' : 'flex min-h-0 flex-1 flex-col'}>
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
      </div>
    </FormColumnFrame>
  );
}

function NothingToEditColumn({
  onOpenCollections,
}: {
  onOpenCollections: () => void;
}) {
  return (
    <FormColumnFrame>
      <PanelHeader trail={[]} heading='Nothing to edit on this page' />
      <div className='p-4'>
        <EmptyState
          variant='block'
          text='This page isn’t drawn from a document. Click a part of it that is, or find one in Collections.'
          actionLabel='Open Collections'
          onAction={onOpenCollections}
        />
      </div>
    </FormColumnFrame>
  );
}

function NothingToEditBar({
  onOpenCollections,
}: {
  onOpenCollections: () => void;
}) {
  return (
    <div
      data-slot='nothing-to-edit-bar'
      className='flex h-14 flex-none items-center gap-2 border-t border-border bg-card px-3'
    >
      <span className='min-w-0 flex-1 truncate text-sm'>
        Nothing to edit here
      </span>
      <Button variant='outline' size='sm' onClick={onOpenCollections}>
        Open Collections
      </Button>
    </div>
  );
}

export interface TinaAdminProps {
  config: ResolvedConfig;
  preview?: ReactNode;
  queryClient?: QueryClient;
}

export function TinaAdmin({ config, preview, queryClient }: TinaAdminProps) {
  const tier = useTier();
  useNoFieldZoom();
  // Portalled content (dialogs, menus, sheets) sits outside the wrapper, so <html> carries the
  // breakpoint too and the `phone:` variants reach it.
  useLayoutEffect(() => {
    document.documentElement.dataset.breakpoint = tier;
    return () => {
      delete document.documentElement.dataset.breakpoint;
    };
  }, [tier]);
  return (
    <div data-breakpoint={tier} className='contents'>
      <AdminErrorBoundary>
        <TinaProvider config={config} queryClient={queryClient}>
          <TooltipProvider>
            <HashRouter>
              <AuthGate>
                <AdminShell
                  preview={preview}
                  projectName={config.projectName}
                />
              </AuthGate>
            </HashRouter>
            <ShellToaster />
          </TooltipProvider>
        </TinaProvider>
      </AdminErrorBoundary>
    </div>
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
    <SidebarInset
      className={hideBelowLg ? 'min-w-0 below-desktop:hidden' : 'min-w-0'}
    >
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
  const tier = useTier();
  const phone = tier === 'phone';
  const [view, setView] = useState<DocumentView>('form');

  // A reference step belongs to the document it opened. Any other navigation drops it.
  const [stepState, setStepState] = useState<{
    step: ReferenceStep;
    target: string;
  } | null>(null);
  const reachedStep = useRef(false);
  const openDocument = useCallback(
    (target: DocumentRef, step: ReferenceStep | null) => {
      if (step) {
        reachedStep.current = false;
        setStepState({ step, target: target.path });
      } else if (stepState?.target === target.path) {
        setStepState(null);
      }
      setView('form');
      navigate({
        view: 'document',
        collection: target.collection,
        path: target.path,
      });
    },
    [navigate, stepState]
  );

  const isMediaRoute =
    route.view === 'media' ||
    (route.view === 'screen' && route.screen === MEDIA_SCREEN);

  // The main area keeps the last route that was not Media; a deep link to Media shows Home.
  const [lastMain, setLastMain] = useState<AdminRoute>(HOME_ROUTE);
  useEffect(() => {
    if (!isMediaRoute) setLastMain(route);
  }, [route, isMediaRoute]);
  const mainRoute = isMediaRoute ? lastMain : route;

  const [desktopMaximised, setMaximised] = useState(false);
  // Below desktop the Media pane always fills the space and has no Maximise.
  const maximised = desktopMaximised || tier !== 'desktop';
  const treeFolders = useTreeFolders();
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
  const activeStep =
    stepState && stepState.target === openPath ? stepState.step : null;
  useKeptEditsNotice(mainRoute, navigate, activeStep);
  // Leaving the step's document by any route drops the step. The route moves
  // after the state that asked for it, so the step is dropped only once the
  // document it belongs to has been shown.
  useEffect(() => {
    if (!stepState) return;
    if (stepState.target === openPath) {
      reachedStep.current = true;
    } else if (reachedStep.current) {
      setStepState(null);
    }
  }, [stepState, openPath]);
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
    mainRoute.view === 'folder'
      ? mainRoute.folder
      : mainRoute.view === 'collection' && mainRoute.maximised
        ? ''
        : undefined;
  const showTable = collection !== undefined && tableFolder !== undefined;
  const showIndex = mainRoute.view === 'collections' && !!mainRoute.maximised;
  const mainShowsNavigator =
    (mainRoute.view === 'collections' && !showIndex) ||
    (mainRoute.view === 'collection' && !showTable) ||
    (mainRoute.view === 'folder' && !showTable) ||
    (mainRoute.view === 'document' && collection === undefined);
  const showNavigator = !isMediaRoute && mainShowsNavigator;
  const overlay =
    mainRoute.view === 'document' &&
    mainRoute.navigator === true &&
    collection !== undefined;
  const showOverlay = overlay && !isMediaRoute;
  const documentFailed = openPath !== undefined && openDocumentError !== null;
  const showsPreviewRoute =
    !activeScreen &&
    !homeSegments &&
    !showIndex &&
    !showTable &&
    !isStaleCollectionRoute &&
    !isStaleDocumentRoute &&
    !documentFailed;
  // Beside the navigator the Home screen takes the pane. The frame stays mounted, hidden.
  const previewVisible =
    showsPreviewRoute &&
    !(mainShowsNavigator && homeScreen) &&
    !(showOverlay && phone);
  const showsPreview = previewVisible && !(isMediaRoute && maximised);
  const [previewMounted, setPreviewMounted] = useState(false);
  useEffect(() => {
    if (showsPreviewRoute) setPreviewMounted(true);
  }, [showsPreviewRoute]);

  // A page click or any move off the preview brings the form back. `focus` says the
  // change came from a control, so focus follows it to the other toggle.
  const [expansion, setExpansion] = useState({ on: false, focus: false });
  const previewExpanded = expansion.on;
  const setPreviewExpanded = useCallback((on: boolean, focus = true) => {
    setExpansion((current) => (current.on === on ? current : { on, focus }));
  }, []);
  useEffect(() => {
    if (!previewVisible || isMediaRoute || tier !== 'desktop') {
      setPreviewExpanded(false, false);
    }
  }, [previewVisible, isMediaRoute, tier, setPreviewExpanded]);
  useEffect(() => {
    if (!previewExpanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          '[role=menu],[role=dialog],[role=alertdialog],[data-slot=save-progress]'
        )
      ) {
        return;
      }
      setPreviewExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewExpanded, setPreviewExpanded]);

  // A tablet enters one view with Maximise; a phone is always in one view. Crossing from a
  // phone to a tablet keeps one view. Desktop shows the split.
  const [tabletMaximised, setTabletMaximised] = useState(false);
  const previousTier = useRef(tier);
  useEffect(() => {
    const before = previousTier.current;
    previousTier.current = tier;
    if (tier === 'desktop') setTabletMaximised(false);
    else if (tier === 'tablet' && before === 'phone') setTabletMaximised(true);
  }, [tier]);
  const documentOpen = mainRoute.view === 'document' && previewVisible;
  const oneViewActive =
    documentOpen && (phone || (tier === 'tablet' && tabletMaximised));
  useEffect(() => {
    if (!previewVisible || isMediaRoute) setTabletMaximised(false);
  }, [previewVisible, isMediaRoute]);
  // A document opens on its form every time.
  useEffect(() => {
    setView('form');
  }, [openPath]);

  const documentRoute = (): AdminRoute =>
    mainRoute.view === 'document'
      ? {
          view: 'document',
          collection: mainRoute.collection,
          path: mainRoute.path,
        }
      : mainRoute;
  const [formFocusRequest, setFormFocusRequest] = useState(0);
  const [previewAsked, setPreviewAsked] = useState(false);
  const toggleMaximise = useCallback(
    (from: DocumentView) => {
      setPreviewAsked(from === 'preview');
      if (tabletMaximised) {
        setTabletMaximised(false);
        if (from === 'form') setFormFocusRequest((n) => n + 1);
        return;
      }
      if (from === 'preview' && mainRoute.view === 'document') {
        if (mainRoute.navigator) {
          navigate({
            view: 'document',
            collection: mainRoute.collection,
            path: mainRoute.path,
          });
        }
      }
      setView(from);
      setTabletMaximised(true);
      if (from === 'form') setFormFocusRequest((n) => n + 1);
    },
    [tabletMaximised, mainRoute, navigate]
  );
  useEffect(() => {
    if (formFocusRequest === 0) return;
    document
      .querySelector<HTMLElement>(
        '[data-form-part=head] button[aria-label$=" form"]'
      )
      ?.focus();
  }, [formFocusRequest]);
  useEffect(() => {
    if (!(tier === 'tablet' && tabletMaximised)) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          '[role=menu],[role=dialog],[role=alertdialog],[data-slot=save-progress]'
        )
      ) {
        return;
      }
      setTabletMaximised(false);
      setFormFocusRequest((n) => n + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tier, tabletMaximised]);
  const oneView = {
    active: oneViewActive,
    view,
    setView,
    canMaximise: tier === 'tablet' && documentOpen,
    toggleMaximise,
  };

  // The Collections column over a document keeps its own moves local, so the form stays mounted.
  const [navigatorRoute, setNavigatorRoute] = useState<AdminRoute | null>(null);
  useEffect(() => {
    if (!overlay) setNavigatorRoute(null);
  }, [overlay]);
  const overlayNavigate = useCallback(
    (target: AdminRoute) => {
      const local =
        target.view === 'collection' ||
        target.view === 'folder' ||
        (target.view === 'collections' && !target.maximised);
      if (local) setNavigatorRoute(target);
      else navigate(target);
    },
    [navigate]
  );
  const closeOverlay = () => {
    setView('form');
    navigate(documentRoute());
  };
  // Focus goes to the navigator on open and back to the field that had it on close.
  const formFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('[data-form-column]')
      ) {
        formFocus.current = event.target;
      }
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);
  const wasOverlay = useRef(false);
  useEffect(() => {
    if (showOverlay) {
      wasOverlay.current = true;
      const frame = requestAnimationFrame(() => {
        const pane = document.querySelector('[aria-label=Navigator]');
        (
          pane?.querySelector<HTMLElement>('[aria-current=page]') ??
          pane?.querySelector<HTMLElement>('button')
        )?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
    if (!wasOverlay.current || overlay) return;
    wasOverlay.current = false;
    const frame = requestAnimationFrame(() => {
      const back = formFocus.current;
      (back?.isConnected
        ? back
        : document.querySelector<HTMLElement>(
            '[data-form-part=head] button, [data-form-part=fields] input'
          )
      )?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [showOverlay, overlay]);

  const connection: PreviewConnectionOptions = {
    open:
      collection && openPath
        ? { collection: collection.name, path: openPath }
        : null,
    step: activeStep,
    showsPreview,
    onPage: mainRoute.view === 'page',
    onOpen: openDocument,
    onNothingToEdit: () => navigate({ view: 'page' }),
    onActivate: () => {
      setPreviewExpanded(false, false);
      setView('form');
    },
  };

  const maximiseNavigator = () =>
    navigate(
      collection
        ? { view: 'collection', collection: collection.name, maximised: true }
        : { view: 'collections', maximised: true }
    );
  const goToFolderOf = (documentPath: string) =>
    collection
      ? navigate(folderRouteOf(collection, documentPath))
      : goToCollections();

  const navigatorOwnsScreen = showNavigator && phone && !isStaleCollectionRoute;
  const preview_phonePage = phone && mainRoute.view === 'page';
  const expandedOnPreview =
    tier === 'tablet' ? tabletMaximised : previewExpanded;

  return (
    <OneViewContext value={oneView}>
      <SidebarProvider
        style={SHELL_WIDTH}
        className='h-svh min-h-0 flex-col overflow-hidden'
      >
        <ShellTopBar projectName={projectName} />
        <UploadHost primary />

        <div
          className={cn(
            'flex min-h-0 flex-1',
            previewExpanded && '[&>:not([data-main-region])]:hidden'
          )}
        >
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
              <NavigatorFrame>
                <MediaPanel onClose={closeMedia} />
              </NavigatorFrame>
            )
          ) : null}

          {showNavigator ? (
            <NavigatorFrame hidden={isStaleCollectionRoute}>
              <CollectionsNavigator
                collections={schema.collections}
                selectedPath={selectedPath}
                route={route}
                navigate={navigate}
                onClose={goHome}
                onMaximise={phone ? undefined : maximiseNavigator}
                treeFolders={treeFolders}
              />
            </NavigatorFrame>
          ) : null}

          {showOverlay ? (
            <NavigatorFrame>
              <CollectionsNavigator
                collections={schema.collections}
                selectedPath={openPath}
                route={navigatorRoute ?? documentRoute()}
                navigate={overlayNavigate}
                onClose={closeOverlay}
                onMaximise={phone ? undefined : maximiseNavigator}
                treeFolders={treeFolders}
              />
            </NavigatorFrame>
          ) : null}

          <div
            data-main-region=''
            className={
              isMediaRoute
                ? maximised
                  ? 'hidden'
                  : 'contents'
                : navigatorOwnsScreen
                  ? 'hidden'
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
            ) : isStaleCollectionRoute ? (
              <MissingPanel title='Collection not found' onClose={goHome}>
                No collection named “{activeCollectionName}”.
              </MissingPanel>
            ) : showIndex ? (
              <SidebarInset className='min-w-0'>
                <CollectionsIndex />
              </SidebarInset>
            ) : showTable ? (
              <SidebarInset className='min-w-0'>
                <CollectionTable
                  key={`${branch ?? ''}/${collection.name}/${tableFolder}`}
                  collection={collection.name}
                  folder={tableFolder}
                  onRestore={(folder) =>
                    treeFolders.reveal(collection.name, folder)
                  }
                />
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
            ) : mainShowsNavigator && homeScreen ? (
              <HomeOutlet screen={homeScreen} segments={[]} />
            ) : null}

            {showsPreviewRoute || previewMounted ? (
              <SidebarInset
                data-one-view={oneViewActive ? view : undefined}
                className={cn(
                  previewVisible ? 'relative min-w-0 flex-row' : 'hidden',
                  (oneViewActive || preview_phonePage) && 'flex-col',
                  oneViewActive &&
                    'data-[one-view=preview]:[&_[data-form-part]]:hidden data-[one-view=form]:[&>[data-preview-slot]]:hidden',
                  previewExpanded && '[&>:not([data-preview-slot])]:hidden'
                )}
              >
                {mainRoute.view === 'document' ? (
                  <DocumentScope
                    collection={collection}
                    path={openPath}
                    onDiscardNew={() =>
                      openPath ? goToFolderOf(openPath) : undefined
                    }
                  >
                    <FormColumn
                      hidden={showOverlay}
                      openPath={openPath}
                      collection={collection}
                      collections={schema.collections}
                      step={activeStep}
                      navigate={navigate}
                    />
                    <DocumentErrorPane />
                    {typeof preview === 'string' ? null : (
                      <PreviewNodeSlot preview={preview} />
                    )}
                  </DocumentScope>
                ) : mainRoute.view === 'page' && !phone ? (
                  <NothingToEditColumn onOpenCollections={goToCollections} />
                ) : null}
                {typeof preview === 'string' ? (
                  <PreviewSlot
                    src={preview}
                    connection={connection}
                    expanded={expandedOnPreview}
                    moveFocus={
                      tier === 'tablet' ? previewAsked : expansion.focus
                    }
                    onExpandedChange={
                      tier === 'tablet'
                        ? () => toggleMaximise('preview')
                        : setPreviewExpanded
                    }
                  />
                ) : mainRoute.view === 'document' ? null : (
                  <PreviewNodeSlot preview={preview} />
                )}
                {preview_phonePage ? (
                  <NothingToEditBar onOpenCollections={goToCollections} />
                ) : null}
              </SidebarInset>
            ) : null}
          </div>
        </div>

        <ShellStatusBar />
        <ShellSaveProgress />
      </SidebarProvider>
    </OneViewContext>
  );
}
