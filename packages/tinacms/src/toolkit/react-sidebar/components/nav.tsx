import { TinaIcon } from '@tinacms/toolkit';
import type { CloudConfigPlugin } from '@toolkit/react-cloud-config';
import { useCMS } from '@toolkit/react-core';
import { FormModal } from '@toolkit/react-forms';
import type { ScreenPlugin } from '@toolkit/react-screens';
import { TinaCMS } from '@toolkit/tina-cms';
import * as React from 'react';
import { BiExit, BiMenu } from 'react-icons/bi';
import { FiInfo } from 'react-icons/fi';
import { VscNewFile } from 'react-icons/vsc';
import { cn } from '../../../utils/cn';
import { VersionInfo } from './VersionInfo';
import { SyncStatusButton, SyncStatusModal } from './sync-status';

interface NavCollection {
  label?: string;
  name: string;
  isAuthCollection?: boolean;
}

interface NavProps {
  isLocalMode: boolean;
  showHamburger?: boolean;
  menuIsOpen: boolean;
  toggleMenu: () => void;
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
  showHamburger = true,
  menuIsOpen,
  toggleMenu,
  className = '',
  children,
  showCollections,
  collectionsInfo,
  screens,
  cloudConfigs,
  contentCreators,
  sidebarWidth,
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

  return (
    <>
      <button
        className={cn(
          'fixed pointer-events-auto p-4 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded z-10',
          menuIsOpen ? 'hidden' : ''
        )}
        onClick={() => {
          toggleMenu();
        }}
      >
        <BiMenu className='h-6 w-auto text-gray-600' />
      </button>

      <div
        className={cn(
          `relative z-30 flex flex-col bg-white border-r border-gray-200 w-96 h-full ${className}`,
          menuIsOpen ? '' : 'hidden'
        )}
        style={{ maxWidth: `${sidebarWidth}px` }}
        {...props}
      >
        <div className='flex w-full px-4 py-3 justify-between items-center gap-2 border-b border-gray-200'>
          <button
            className={cn(
              'pointer-events-auto p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
            )}
            onClick={() => {
              toggleMenu();
            }}
          >
            <BiMenu className='h-6 w-auto text-gray-600' />
          </button>

          <span className='text-left inline-flex items-center text-xl tracking-wide text-gray-800/80 flex-1 gap-1'>
            <TinaIcon className='w-10 h-auto -ml-1 fill-orange-500' />
            <span>TinaCMS</span>
          </span>
        </div>
        {children}
        <div className='flex flex-col px-6 flex-1 overflow-auto'>
          {showCollections && (
            <>
              <h4 className='flex space-x-1 justify-items-start uppercase font-sans font-bold text-sm mb-3 mt-8 text-gray-700'>
                <span>Collections</span>
                {isLocalMode && (
                  <span className='flex items-center'>
                    <a
                      href='https://tina.io/docs/schema/#defining-collections'
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
          {(screenCategories.Site.length > 0 || contentCreators.length) > 0 && (
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
      </div>

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
