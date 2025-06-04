import { Menu, MenuItem, MenuItems, Transition } from '@headlessui/react';
import type { CloudConfigPlugin } from '@toolkit/react-cloud-config';
import { useCMS } from '@toolkit/react-core';
import { FormModal } from '@toolkit/react-forms';
import type { ScreenPlugin } from '@toolkit/react-screens';
import * as React from 'react';
import { BiExit, BiMenu } from 'react-icons/bi';
import { FiInfo, FiMoreVertical } from 'react-icons/fi';
import { VscNewFile } from 'react-icons/vsc';
import { version } from '../../../../package.json';
import { SidebarContext, updateBodyDisplacement } from './sidebar';
import { SyncErrorWidget, SyncStatus, SyncStatusModal } from './sync-status';

interface NavCollection {
  label?: string;
  name: string;
  isAuthCollection?: boolean;
}

interface NavProps {
  isLocalMode: boolean;
  showHamburger?: boolean;
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

  function closeEventsModal() {
    setEventsOpen(false);
  }

  const WrappedSyncStatus = React.forwardRef(
    (props: { cms; setEventsOpen }, ref) => <SyncStatus {...props} />
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
    <div
      className={`relative z-30 flex flex-col bg-white border-r border-gray-200 w-96 h-full ${className}`}
      style={{ maxWidth: `${sidebarWidth}px` }}
      {...props}
    >
      <div className='flex w-full px-4 pt-1 pb-3 justify-between items-center gap-2 border-b border-gray-200'>
        {showHamburger && (
          <button
            className='pointer-events-auto p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
            onClick={toggleMenu}
          >
            <BiMenu className='h-6 w-auto text-gray-600' />
          </button>
        )}
        <span className='text-left inline-flex items-center text-xl tracking-wide text-gray-800 flex-1 gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-150 ease-out'>
          <svg
            viewBox='0 0 32 32'
            fill='#EC4815'
            xmlns='http://www.w3.org/2000/svg'
            className='w-10 h-auto -ml-1'
          >
            <path d='M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z' />
            <path d='M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z' />
          </svg>
          <span>Tina</span>
        </span>
        <SyncErrorWidget cms={cms} />
      </div>
      {eventsOpen && (
        <SyncStatusModal cms={cms} closeEventsModal={closeEventsModal} />
      )}
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
                  <CreateContentNavItem key={`plugin-${idx}`} plugin={plugin} />
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
        <div className='grow'></div>
        <WrappedSyncStatus cms={cms} setEventsOpen={setEventsOpen} />
        <button
          className='text-lg py-2 first:pt-3 last:pb-3 whitespace-nowrap flex items-center opacity-80 text-gray-600 hover:text-blue-400'
          onClick={async () => {
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
          }}
        >
          <BiExit className='w-6 h-auto mr-2' /> Log Out
        </button>
        <span className='font-sans font-light text-xs mb-3 mt-4 text-gray-500'>
          v{version}
        </span>
      </div>
    </div>
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
