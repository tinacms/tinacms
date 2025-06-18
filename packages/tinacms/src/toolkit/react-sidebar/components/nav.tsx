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
            <svg width="156" height="32" viewBox="0 0 978 200" fill="none" xmlns="http://www.w3.org/2000/svg">Add commentMore actions
              <path d="M110.41 0H89.833C84.4694 0 80.1214 4.34675 80.1214 9.70874V30.2791C80.1214 35.6411 84.4694 39.9879 89.833 39.9879H110.41C115.773 39.9879 120.121 35.6411 120.121 30.2791V9.70874C120.121 4.34675 115.773 0 110.41 0Z" fill="#421B30"/>
              <path d="M30.2883 80.0364H9.71168C4.34807 80.0364 0 84.3832 0 89.7452V110.316C0 115.678 4.34807 120.024 9.71168 120.024H30.2883C35.6519 120.024 40 115.678 40 110.316V89.7452C40 84.3832 35.6519 80.0364 30.2883 80.0364Z" fill="#421B30"/>
              <path d="M190.288 80.0364H169.712C164.348 80.0364 160 84.3832 160 89.7452V110.316C160 115.678 164.348 120.024 169.712 120.024H190.288C195.652 120.024 200 115.678 200 110.316V89.7452C200 84.3832 195.652 80.0364 190.288 80.0364Z" fill="#421B30"/>
              <path d="M150.288 120.024H129.712C124.346 120.024 120 115.676 120 110.316V89.7452C120 84.3811 124.346 80.0364 129.712 80.0364H150.288C155.65 80.0364 160 75.6877 160 70.3277V49.7573C160 44.3932 155.65 40.0485 150.288 40.0485H129.712C124.346 40.0485 120 44.3932 120 49.7573V70.3277C120 75.6877 115.65 80.0364 110.288 80.0364H89.7116C84.3459 80.0364 80 75.6877 80 70.3277V49.7573C80 44.3932 75.6499 40.0485 70.2883 40.0485H49.7117C44.346 40.0485 40 44.3932 40 49.7573V70.3277C40 75.6877 44.346 80.0364 49.7117 80.0364H70.2883C75.6499 80.0364 80 84.3811 80 89.7452V110.316C80 115.676 75.6499 120.024 70.2883 120.024H49.7117C44.346 120.024 40 124.369 40 129.733V150.303C40 155.663 44.346 160.012 49.7117 160.012H70.2883C75.6499 160.012 80 155.663 80 150.303V129.733C80 124.369 84.3459 120.024 89.7116 120.024H110.288C115.65 120.024 120 124.369 120 129.733V150.303C120 155.663 124.346 160.012 129.712 160.012H150.288C155.65 160.012 160 155.663 160 150.303V129.733C160 124.369 155.65 120.024 150.288 120.024Z" fill="#421B30"/>
              <path d="M110.288 160.012H89.7116C84.348 160.012 80 164.359 80 169.721V190.291C80 195.653 84.348 200 89.7116 200H110.288C115.652 200 120 195.653 120 190.291V169.721C120 164.359 115.652 160.012 110.288 160.012Z" fill="#421B30"/>
              <path d="M951.943 144.726C935.98 144.726 925.629 136.37 924.008 123.275H935.855C937.726 131.257 944.585 134.499 952.192 134.499C959.301 134.499 965.162 131.132 965.162 125.645C965.162 120.033 960.049 118.287 952.941 117.165L945.832 115.918C933.985 113.922 926.003 108.934 926.003 97.7097C926.003 86.2363 936.229 78.6289 950.571 78.6289C964.664 78.6289 974.516 85.7374 976.885 98.458H965.162C963.167 91.5989 957.43 88.6058 950.696 88.6058C943.338 88.6058 938.599 92.0977 938.599 96.8367C938.599 101.825 942.34 103.446 949.823 104.694L956.807 105.816C968.654 107.811 977.634 112.55 977.634 124.647C977.634 136.994 966.784 144.726 951.943 144.726Z" fill="#421B30"/>
              <path d="M918.914 79.3789H919.911V93.0971C918.165 92.8477 917.043 92.723 915.172 92.723C904.447 92.723 896.092 99.208 896.092 112.427V142.857H883.371V80.5013H895.967V93.2218C900.332 84.1179 908.812 79.3789 918.914 79.3789Z" fill="#421B30"/>
              <path d="M872.615 114.047H823.354C824.102 126.393 832.208 133.751 842.435 133.751C851.414 133.751 856.901 129.636 859.271 122.278H872.116C868.998 135.248 857.525 144.726 842.435 144.726C823.603 144.726 810.883 131.631 810.883 111.677C810.883 91.8483 824.102 78.6289 842.435 78.6289C861.391 78.6289 872.615 93.0954 872.615 111.677V114.047ZM842.31 89.2293C833.081 89.2293 825.1 95.0908 823.603 105.192H860.019C858.772 95.5896 851.788 89.2293 842.31 89.2293Z" fill="#421B30"/>
              <path d="M779.687 78.6289C792.532 78.6289 801.137 87.3587 801.137 101.451V142.855H788.292V105.317C788.292 96.8367 784.426 90.227 774.823 90.227C765.844 90.227 759.982 97.3356 759.982 105.192V142.855H747.262V80.4996H759.982V89.2294C763.973 83.1185 771.082 78.6289 779.687 78.6289Z" fill="#421B30"/>
              <path d="M732.306 70.5268H719.336V56.8086H732.306V70.5268ZM732.181 142.859H719.461V80.5037H732.181V142.859Z" fill="#421B30"/>
              <path d="M704.377 142.859H691.656V56.8086H704.377V142.859Z" fill="#421B30"/>
              <path d="M654.943 78.6289C668.536 78.6289 677.141 87.6081 677.141 101.825V142.855H664.421V105.068C664.421 96.712 660.555 90.227 651.202 90.227C642.472 90.227 636.486 96.9614 636.486 104.694V142.855H623.765V105.068C623.765 96.712 619.899 90.227 610.421 90.227C601.816 90.227 595.83 97.2109 595.83 104.818V142.855H583.109V80.4996H595.83V88.6058C600.07 82.8691 606.929 78.6289 615.035 78.6289C623.765 78.6289 630.25 82.495 633.742 89.2294C638.107 83.4926 645.714 78.6289 654.943 78.6289Z" fill="#421B30"/>
              <path d="M536.872 144.726C524.775 144.726 515.172 137.617 515.172 125.645C515.172 110.056 531.758 105.691 550.465 105.068L558.072 104.818V102.199C558.072 94.2178 553.209 89.1046 544.354 89.1046C535.999 89.1046 530.761 93.4695 529.514 100.453H517.167C518.664 87.9822 528.391 78.6289 544.354 78.6289C560.193 78.6289 569.92 87.1093 569.92 102.075V131.881C569.92 135.747 570.294 141.109 570.544 142.606V142.855H558.072C557.948 140.86 557.948 136.37 557.948 134.375C553.832 140.111 546.848 144.726 536.872 144.726ZM540.114 134.874C551.338 134.874 558.072 126.518 558.072 118.162V113.049C556.701 113.049 554.955 113.049 552.46 113.174C539.241 113.922 528.142 116.167 528.142 124.897C528.142 131.257 533.13 134.874 540.114 134.874Z" fill="#421B30"/>
              <path d="M507.412 114.047H458.151C458.899 126.393 467.005 133.751 477.232 133.751C486.211 133.751 491.698 129.636 494.068 122.278H506.913C503.795 135.248 492.322 144.726 477.232 144.726C458.4 144.726 445.68 131.631 445.68 111.677C445.68 91.8483 458.899 78.6289 477.232 78.6289C496.188 78.6289 507.412 93.0954 507.412 111.677V114.047ZM477.107 89.2293C467.878 89.2293 459.897 95.0908 458.4 105.192H494.816C493.569 95.5896 486.585 89.2293 477.107 89.2293Z" fill="#421B30"/>
              <path d="M442.047 79.3789H443.044V93.0971C441.298 92.8477 440.176 92.723 438.305 92.723C427.58 92.723 419.224 99.208 419.224 112.427V142.857H406.504V80.5013H419.1V93.2218C423.465 84.1179 431.945 79.3789 442.047 79.3789Z" fill="#421B30"/>
              <path d="M394.616 143.35H377.406C370.796 143.35 367.18 139.609 367.18 132.75V90.0988H355.457V80.9949C367.803 80.496 369.674 75.3829 369.799 61.9141H379.402V80.496H394.616V90.0988H379.776V128.884C379.776 132.002 380.898 133.249 384.265 133.249H394.616V143.35Z" fill="#421B30"/>
              <path d="M319.126 144.726C298.548 144.726 285.828 133.626 283.957 117.913H297.052C299.92 129.012 309.024 133.252 319.126 133.252C329.851 133.252 337.084 127.765 337.084 120.157C337.084 112.051 331.472 108.559 319.5 105.94L310.271 103.82C298.299 101.077 286.95 94.467 286.95 80.0005C286.95 65.7835 299.296 54.9336 317.38 54.9336C336.211 54.9336 346.437 65.2846 349.181 80.7488H336.086C333.717 70.8966 327.356 66.407 317.38 66.407C306.53 66.407 300.294 71.8943 300.294 78.8781C300.294 86.2361 305.532 89.4786 316.756 92.0975L325.985 94.3423C338.955 97.3354 350.802 103.321 350.802 118.91C350.802 133.876 338.206 144.726 319.126 144.726Z" fill="#421B30"/>
            </svg>
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
