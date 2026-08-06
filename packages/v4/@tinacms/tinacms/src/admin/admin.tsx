import type { QueryClient } from '@tanstack/react-query';
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
  useRef,
  useState,
} from 'react';
import { HashRouter } from 'react-router-dom';
import type { ResolvedConfig } from '../config';
import type { CollectionSchema } from '../core/schema/types';
import type { AdminScreen } from '../core/screen/contract';
import { useCollectionDocuments } from '../editor/content-queries';
import { FormScopeContext } from '../editor/context';
import { usePreviewConnection } from '../editor/preview-connection';
import { TinaProvider } from '../editor/provider';
import { toFormId } from '../form/form-store';
import { DocumentForm } from './document-form';
import { DocumentScope } from './document-scope';
import { FormStatusBadge } from './document-status';
import { useAdminScreens, useTinaSchema } from './hooks';
import { type AdminRoute, COLLECTIONS_ROUTE } from './routing';
import { useAdminRoute } from './use-admin-route';
import { useFormColumnWidth } from './use-form-column-width';

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
      {documents.map(({ path, error }) => (
        <SidebarMenuItem key={path}>
          <SidebarMenuButton
            isActive={path === activePath}
            aria-label={documentName(path)}
            title={error}
            onClick={() =>
              navigate({ view: 'document', collection: collection.name, path })
            }
          >
            <span className='flex-1 truncate'>{documentName(path)}</span>
            {error ? (
              <span role='alert' className='text-destructive text-xs'>
                Cannot read
              </span>
            ) : (
              <FormStatusBadge formId={toFormId(path)} />
            )}
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

function PreviewSlot({ preview }: { preview?: ReactNode }) {
  if (!use(FormScopeContext)) {
    return <Placeholder>Select a document to edit.</Placeholder>;
  }
  if (typeof preview === 'string') return <PreviewFrame src={preview} />;
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
        className='flex min-w-0 shrink-0 flex-col overflow-y-auto border-r border-border p-4'
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
          <DocumentForm key={seedKey} />
        ) : (
          <FormColumnSkeleton />
        )}
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
    <TinaProvider config={config} queryClient={queryClient}>
      <HashRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AdminShell preview={preview} />
      </HashRouter>
    </TinaProvider>
  );
}

function AdminShell({ preview }: { preview?: ReactNode }) {
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
  const isStaleCollectionRoute =
    activeCollectionName !== undefined && collection === undefined;

  return (
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

      {activeScreen ? (
        <ScreenOutlet
          name={activeScreen.screen}
          screen={screens.find(
            (candidate) => candidate.name === activeScreen.screen
          )}
          segments={activeScreen.segments}
        />
      ) : (
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
}
