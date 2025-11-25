import { TinaExtendedIcon } from '@tinacms/toolkit';
import type { CloudConfigPlugin } from '@toolkit/react-cloud-config';
import { useCMS } from '@toolkit/react-core';
import { FormModal } from '@toolkit/react-forms';
import type { ScreenPlugin } from '@toolkit/react-screens';
import { TinaCMS } from '@toolkit/tina-cms';
import * as React from 'react';
import { BiExit, BiMenu, BiX } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';
import { VscNewFile } from 'react-icons/vsc';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '../../components/ui/sheet';
import { VersionInfo } from './VersionInfo';
import { SyncStatusButton, SyncStatusModal } from './sync-status';

interface NavCollection {
  label?: string;
  name: string;
  isAuthCollection?: boolean;
}

interface NavProps {
  isLocalMode: boolean;
  children?: any;
  className?: string;
  userName?: string;
  showCollections: boolean;
  collectionsInfo: {
    collections: NavCollection[];
  };
  contentCreators?: any;
  screens?: ScreenPlugin[];
  cloudConfigs?: CloudConfigPlugin[];
  sidebarWidth?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  RenderNavSite: React.ComponentType<{ view: ScreenPlugin }>;
  RenderNavCloud: React.ComponentType<{ config: CloudConfigPlugin }>;
  RenderNavCollection: React.ComponentType<{
    collection: { label: string; name: string };
  }>;
  AuthRenderNavCollection: React.ComponentType<{
    collection: { label: string; name: string };
  }>;
}

const partitionCollections = (collections: NavCollection[]) => {
  return collections.reduce(
    (acc, collection) => {
      if (collection.isAuthCollection) {
        acc.authCollection = collection;
      } else {
        acc.contentCollections.push(collection);
      }
      return acc;
    },
    {
      contentCollections: [] as NavCollection[],
      authCollection: undefined as NavCollection | undefined,
    }
  );
};

const partitionScreens = (screens: ScreenPlugin[] = []) => {
  return screens.reduce(
    (acc, screen) => {
      const category = screen.navCategory || 'Site';
      acc[category] = acc[category] || [];
      acc[category].push(screen);
      return acc;
    },
    { Site: [] as ScreenPlugin[] } as Record<string, ScreenPlugin[]>
  );
};

const SECTION_HEADING_CLASS =
  'uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700';
const NAV_LINK_CLASS =
  'text-lg py-2 first:pt-3 last:pb-3 whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400';

export const Nav = ({
  isLocalMode,
  className = '',
  children,
  showCollections,
  collectionsInfo,
  screens,
  cloudConfigs,
  contentCreators,
  sidebarWidth,
  defaultOpen = false,
  open,
  onOpenChange,
  RenderNavSite,
  RenderNavCloud,
  RenderNavCollection,
  AuthRenderNavCollection,
  ...props
}: NavProps) => {
  const cms = useCMS();
  const [eventsOpen, setEventsOpen] = React.useState(false);

  const { contentCollections, authCollection } = partitionCollections(
    collectionsInfo.collections
  );
  const screenCategories = partitionScreens(screens);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const sheetProps = isControlled ? { open, onOpenChange } : { defaultOpen };

  return (
    <>
      <Sheet {...sheetProps}>
        {!isControlled && (
          <SheetTrigger asChild>
            <button
              className='pointer-events-auto  p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
              aria-label='Toggle navigation menu'
            >
              <BiMenu className='h-8 w-auto text-gray-600' />
            </button>
          </SheetTrigger>
        )}
        <SheetContent
          side='left'
          className={`flex flex-col w-96 ${className}`}
          style={{ maxWidth: `${sidebarWidth}px` }}
          {...props}
        >
          <SheetHeader>
            <SheetTitle>
              <TinaExtendedIcon className='h-8 w-auto fill-orange-500' />
            </SheetTitle>
            <SheetClose className='p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'>
              <BiX className='h-8 w-auto text-gray-600' />
              <span className='sr-only'>Close</span>
            </SheetClose>
          </SheetHeader>
          <div className='flex flex-col px-6 flex-1 overflow-auto'>
            {showCollections && (
              <>
                <h4
                  className={`flex space-x-1 justify-items-start ${SECTION_HEADING_CLASS}`}
                >
                  <span>Collections</span>
                  {isLocalMode && (
                    <span className='flex items-center'>
                      <a
                        href='https://tina.io/docs/r/content-modelling-collections'
                        target='_blank'
                      >
                        <FiInfo />
                      </a>
                    </span>
                  )}
                </h4>
                <CollectionsList
                  RenderNavCollection={RenderNavCollection}
                  collections={contentCollections}
                />
              </>
            )}
            {(screenCategories.Site.length > 0 || contentCreators.length) >
              0 && (
              <>
                <h4 className={SECTION_HEADING_CLASS}>Site</h4>
                <ul className='flex flex-col gap-4'>
                  {screenCategories.Site.map((view) => {
                    return (
                      <li key={`nav-site-${view.name}`}>
                        <RenderNavSite view={view} />
                      </li>
                    );
                  })}

                  {contentCreators.map((plugin, idx) => {
                    return (
                      <CreateContentNavItem
                        key={`plugin-${idx}`}
                        plugin={plugin}
                      />
                    );
                  })}
                  {authCollection && (
                    <CollectionsList
                      RenderNavCollection={AuthRenderNavCollection}
                      collections={[authCollection]}
                    />
                  )}
                </ul>
              </>
            )}
            {Object.entries(screenCategories).map(([category, screens]) => {
              if (category !== 'Site') {
                return (
                  <div key={category}>
                    <h4 className={SECTION_HEADING_CLASS}>{category}</h4>
                    <ul className='flex flex-col gap-4'>
                      {screens.map((view) => {
                        return (
                          <li key={`nav-site-${view.name}`}>
                            <RenderNavSite view={view} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              }
            })}
            {!!cloudConfigs?.length && (
              <>
                <h4 className={SECTION_HEADING_CLASS}>Cloud</h4>
                <ul className='flex flex-col gap-4'>
                  {cloudConfigs.map((config) => {
                    return (
                      <li key={`nav-site-${config.name}`}>
                        <RenderNavCloud config={config} />
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <div className='grow my-4 border-b border-gray-200'></div>

            <SyncStatusButton
              className={NAV_LINK_CLASS}
              cms={cms}
              setEventsOpen={setEventsOpen}
            />
            <Logout className={NAV_LINK_CLASS} cms={cms} />
            <VersionInfo />
          </div>
        </SheetContent>
      </Sheet>

      {eventsOpen && (
        <SyncStatusModal
          cms={cms}
          closeEventsModal={() => setEventsOpen(false)}
        />
      )}
    </>
  );
};

const CollectionsList = ({
  collections,
  RenderNavCollection,
}: {
  collections: { label?: string; name: string }[];
  RenderNavCollection: React.ComponentType<{
    collection: { label?: string; name: string };
  }>;
}) => {
  if (collections.length === 0) {
    return <div>No collections found</div>;
  }

  return (
    <ul className='flex flex-col gap-4'>
      {collections.map((collection) => {
        return (
          <li key={`nav-collection-${collection.name}`}>
            <RenderNavCollection collection={collection} />
          </li>
        );
      })}
    </ul>
  );
};

const CreateContentNavItem = ({ plugin }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <li key={plugin.name}>
      <button
        className='text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100'
        onClick={() => {
          setOpen(true);
        }}
      >
        <VscNewFile className='mr-3 h-6 opacity-80 w-auto' /> {plugin.name}
      </button>
      {open && <FormModal plugin={plugin} close={() => setOpen(false)} />}
    </li>
  );
};

const Logout = ({
  cms,
  ...buttonProps
}: { cms: TinaCMS } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const handleLogout = async () => {
    try {
      if (cms?.api?.tina?.authProvider?.logout) {
        await cms.api.tina?.authProvider.logout();
        if (cms?.api?.tina?.onLogout) {
          await cms?.api?.tina?.onLogout();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        window.location.href = new URL(window.location.href).pathname;
      }
    } catch (e) {
      cms.alerts.error(`Error logging out: ${e}`);
      console.error('Unexpected error calling logout');
      console.error(e);
    }
  };

  return (
    <button onClick={handleLogout} {...buttonProps}>
      <BiExit className='w-6 h-auto mr-2' /> Log Out
    </button>
  );
};
