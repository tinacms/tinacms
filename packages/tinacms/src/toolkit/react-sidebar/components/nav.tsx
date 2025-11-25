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
  const { contentCollections, authCollection } =
    collectionsInfo.collections.reduce(
      (
        acc: {
          contentCollections: NavCollection[];
          authCollection?: NavCollection;
        },
        collection: NavCollection
      ) => {
        if (collection.isAuthCollection) {
          acc.authCollection = collection;
        } else {
          acc.contentCollections.push(collection);
        }
        return acc;
      },
      {
        contentCollections: [],
      }
    );

  // partition screens by navCategory prop
  const screenCategories = screens.reduce(
    (acc, screen) => {
      const category = screen.navCategory || 'Site';
      acc[category] = acc[category] || [];
      acc[category].push(screen);
      return acc;
    },
    { Site: [] }
  );

  const sheetProps =
    open !== undefined && onOpenChange !== undefined
      ? { open, onOpenChange }
      : { defaultOpen };

  return (
    <>
      <Sheet {...sheetProps}>
        <SheetTrigger asChild>
          <button
            className='pointer-events-auto  p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
            aria-label='Toggle navigation menu'
          >
            <BiMenu className='h-8 w-auto' color='#4B5563' />
          </button>
        </SheetTrigger>
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
              <BiX className='h-8 w-auto' color='#4B5563' />
              <span className='sr-only'>Close</span>
            </SheetClose>
          </SheetHeader>
          <div className='flex flex-col px-6 flex-1 overflow-auto'>
            {showCollections && (
              <>
                <h4 className='flex space-x-1 justify-items-start uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700'>
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
                <h4 className='uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700'>
                  Site
                </h4>
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
                    <h4 className='uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700'>
                      {category}
                    </h4>
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
                <h4 className='uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700'>
                  Cloud
                </h4>
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
              className='text-lg py-2 first:pt-3 last:pb-3 whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400'
              cms={cms}
              setEventsOpen={setEventsOpen}
            />
            <Logout
              className='text-lg py-2 first:pt-3 last:pb-3 whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400'
              cms={cms}
            />
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
        <span className='mr-3 opacity-80'>
          <VscNewFile size={24} />
        </span>{' '}
        {plugin.name}
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
      <span className='mr-2'>
        <BiExit size={24} />
      </span>{' '}
      Log Out
    </button>
  );
};
