import { Transition, TransitionChild } from '@headlessui/react';
import {
  BranchButton,
  BranchPreviewButton,
} from '@toolkit/plugin-branch-switcher';
import type { CloudConfigPlugin } from '@toolkit/react-cloud-config';
import { useCMS, useSubscribable } from '@toolkit/react-core';
import { type ScreenPlugin, ScreenPluginModal } from '@toolkit/react-screens';
import { Button } from '@toolkit/styles';
import * as React from 'react';
import { useState } from 'react';
import { BiMenu } from 'react-icons/bi';
import { ImFilesEmpty, ImUsers } from 'react-icons/im';
import type { IconType } from 'react-icons/lib';
import { PiSidebarSimpleLight } from 'react-icons/pi';
import type { SidebarState, SidebarStateOptions } from '../sidebar';
import { BillingWarning, LocalWarning } from './local-warning';
import { Nav } from './nav';
import { ResizeHandle } from './resize-handle';
import { FormsView } from './sidebar-body';

// TODO: REMOVE - Temporary import for testing CreateBranchModal
import { CreateBranchModal } from '../../form-builder/form-builder';

export const SidebarContext = React.createContext<any>(null);
export const minPreviewWidth = 440;
export const minSidebarWidth = 360;

const LOCALSTATEKEY = 'tina.sidebarState';
const LOCALWIDTHKEY = 'tina.sidebarWidth';

const defaultSidebarWidth = 440;
const defaultSidebarPosition = 'displace';
const defaultSidebarState = 'open';

export interface SidebarProviderProps {
  sidebar: SidebarState;
  resizingSidebar: boolean;
  setResizingSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  defaultWidth?: SidebarStateOptions['defaultWidth'];
  position?: SidebarStateOptions['position'];
  defaultState?: SidebarStateOptions['defaultState'];
}

export function SidebarProvider({
  position = defaultSidebarPosition,
  resizingSidebar,
  setResizingSidebar,
  defaultWidth = defaultSidebarWidth,
  sidebar,
}: SidebarProviderProps) {
  useSubscribable(sidebar);
  const cms = useCMS();
  if (!cms.enabled) return null;

  return (
    <Sidebar
      // @ts-ignore
      position={cms?.sidebar?.position || position}
      // @ts-ignore
      defaultWidth={cms?.sidebar?.defaultWidth || defaultWidth}
      resizingSidebar={resizingSidebar}
      setResizingSidebar={setResizingSidebar}
      renderNav={
        // @ts-ignore
        typeof cms?.sidebar?.renderNav !== 'undefined'
          ? // @ts-ignore
            cms.sidebar.renderNav
          : true
      }
      sidebar={sidebar}
    />
  );
}

interface SidebarProps {
  sidebar: SidebarState;
  resizingSidebar: boolean;
  setResizingSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  defaultWidth?: SidebarStateOptions['defaultWidth'];
  defaultState?: SidebarStateOptions['defaultState'];
  position?: SidebarStateOptions['position'];
  renderNav?: boolean;
}

const useFetchCollections = (cms) => {
  return { collections: cms.api.admin.fetchCollections(), loading: false };
};

const Sidebar = ({
  sidebar,
  defaultWidth,
  // defaultState,
  position,
  renderNav,
  resizingSidebar,
  setResizingSidebar,
}: SidebarProps) => {
  const cms = useCMS();
  const collectionsInfo = useFetchCollections(cms);

  const [branchingEnabled, setBranchingEnabled] = React.useState(() =>
    cms.flags.get('branch-switcher')
  );
  React.useEffect(() => {
    cms.events.subscribe('flag:set', ({ key, value }) => {
      if (key === 'branch-switcher') {
        setBranchingEnabled(value);
      }
    });
  }, [cms.events]);

  const screens = cms.plugins.getType<ScreenPlugin>('screen');
  const cloudConfigs = cms.plugins.getType<CloudConfigPlugin>('cloud-config');

  useSubscribable(sidebar);
  useSubscribable(screens);
  const allScreens = screens.all();
  const allConfigs = cloudConfigs.all();

  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [activeScreen, setActiveView] = useState<ScreenPlugin | null>(null);
  const [sidebarWidth, setSidebarWidth] = React.useState<any>(defaultWidth);
  const [formIsPristine, setFormIsPristine] = React.useState(true);
  const activeScreens = allScreens.filter(
    (screen) =>
      screen.navCategory !== 'Account' ||
      cms.api.tina?.authProvider?.getLoginStrategy() === 'UsernamePassword'
  );

  const setDisplayState = (value: 'closed' | 'fullscreen' | 'open') =>
    cms.dispatch({ type: 'sidebar:set-display-state', value: value });
  const displayState = cms.state.sidebarDisplayState;

  // TODO: REMOVE - Temporary state for testing CreateBranchModal
  const [showTestModal, setShowTestModal] = React.useState(true);
  const [testModalInProgress, setTestModalInProgress] = React.useState(true);
  const [useTestMode, setUseTestMode] = React.useState(true); // Toggle between test and normal mode

  /* Set sidebar open state and width to local values if available */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localSidebarState = window.localStorage.getItem(LOCALSTATEKEY);
      const localSidebarWidth = window.localStorage.getItem(LOCALWIDTHKEY);

      if (localSidebarState !== null) {
        setDisplayState(JSON.parse(localSidebarState));
      }

      if (localSidebarWidth !== null) {
        setSidebarWidth(JSON.parse(localSidebarWidth));
      }
    }
  }, []);

  /* If the default sidebar state changes, update current state if no local value is found */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localSidebarState = window.localStorage.getItem(LOCALSTATEKEY);

      if (localSidebarState === null) {
        setDisplayState(defaultSidebarState);
      }
    }
  }, [defaultSidebarState]);

  /* Update the local value of the sidebar state any time it updates, if the CMS is loaded */
  React.useEffect(() => {
    if (typeof window !== 'undefined' && cms.enabled) {
      window.localStorage.setItem(LOCALSTATEKEY, JSON.stringify(displayState));
    }
  }, [displayState, cms]);

  /* Update the local value of the sidebar width any time the user drags to resize it */
  React.useEffect(() => {
    if (resizingSidebar) {
      window.localStorage.setItem(LOCALWIDTHKEY, JSON.stringify(sidebarWidth));
    }
  }, [sidebarWidth, resizingSidebar]);

  const isTinaAdminEnabled =
    cms.flags.get('tina-admin') === false ? false : true;

  /**
   * Only show ContentCreators when TinaAdmin is disabled
   */
  const contentCreators = isTinaAdminEnabled
    ? []
    : cms.plugins.getType('content-creator').all();

  const toggleFullscreen = () => {
    if (displayState === 'fullscreen') {
      setDisplayState('open');
    } else {
      setDisplayState('fullscreen');
    }
  };

  const toggleSidebarOpen = () => {
    cms.dispatch({ type: 'toggle-edit-state' });
  };

  const toggleMenu = () => {
    setMenuIsOpen((menuIsOpen) => !menuIsOpen);
  };

  // update the iframe body padding when the sidebar is resized or the display state changes
  React.useEffect(() => {
    const updateLayout = () => {
      if (displayState === 'fullscreen') {
        return;
      }
      updateBodyDisplacement({
        position,
        displayState,
        sidebarWidth,
        resizingSidebar,
      });
    };

    updateLayout();

    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
    };
  }, [displayState, position, sidebarWidth, resizingSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        sidebarWidth,
        setSidebarWidth,
        displayState,
        setDisplayState,
        position,
        toggleFullscreen,
        toggleSidebarOpen,
        resizingSidebar,
        setResizingSidebar,
        menuIsOpen,
        setMenuIsOpen,
        toggleMenu,
        setActiveView,
        formIsPristine,
        setFormIsPristine,
      }}
    >
      <>
        {/* TODO: REMOVE - Temporary development section for testing CreateBranchModal */}
        {showTestModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 9999,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                minWidth: '400px',
                maxWidth: '500px',
              }}
            >
              <h3 style={{ margin: '0 0 15px 0' }}>
                CreateBranchModal Testing
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <p
                  style={{
                    margin: '0 0 10px 0',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  Toggle between normal implementation and test mode to see
                  progress immediately
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() => setTestModalInProgress(!testModalInProgress)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: testModalInProgress
                      ? '#dc3545'
                      : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {testModalInProgress ? 'Hide Modal' : 'Show Modal'}
                </button>
                <button
                  onClick={() => setUseTestMode(!useTestMode)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: useTestMode ? '#ffc107' : '#007bff',
                    color: useTestMode ? '#000' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {useTestMode ? 'Test Mode ON' : 'Test Mode OFF'}
                </button>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <p
                  style={{
                    margin: '0 0 5px 0',
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  <strong>Current Mode:</strong>{' '}
                  {useTestMode
                    ? 'Test Mode (isExecuting: true)'
                    : 'Normal Mode (isExecuting: false)'}
                </p>
                <ul
                  style={{
                    margin: '0',
                    padding: '0 0 0 20px',
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  <li>
                    <strong>Test Mode:</strong> Shows progress state immediately
                  </li>
                  <li>
                    <strong>Normal Mode:</strong> Shows form first, then
                    progress after submit
                  </li>
                  <li>
                    Steps: Creating branch → Indexing branch → Creating PR
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Close Test Panel
              </button>
            </div>
          </div>
        )}

        {/* TODO: REMOVE - Temporary CreateBranchModal for testing */}
        {testModalInProgress && (
          <CreateBranchModal
            safeSubmit={async () => {
              console.log(
                '🔄 Mock safeSubmit called - simulating async operation'
              );
              await new Promise((resolve) => setTimeout(resolve, 1500));
              console.log('✅ Mock safeSubmit completed');
            }}
            close={() => {
              console.log('❌ Mock close called - modal should close');
              setTestModalInProgress(false);
            }}
            path='content/pages/test-page.md'
            values={{
              title: 'Test Page for CreateBranchModal',
              body: 'This is test content to simulate a real document being saved.',
              slug: 'test-page-modal',
              date: new Date().toISOString(),
            }}
            crudType='update'
            testMode={useTestMode}
          />
        )}

        <SidebarWrapper>
          <EditButton />
          <SidebarBody>
            <SidebarHeader
              isLocalMode={cms.api?.tina?.isLocalMode}
              branchingEnabled={branchingEnabled}
            />
            <FormsView loadingPlaceholder={sidebar.loadingPlaceholder} />
            {activeScreen && (
              <ScreenPluginModal
                screen={activeScreen}
                close={() => setActiveView(null)}
              />
            )}
          </SidebarBody>
          <ResizeHandle />
        </SidebarWrapper>
        <Transition show={menuIsOpen} as='div'>
          <TransitionChild
            enter='transform transition-all ease-out duration-300'
            enterFrom='opacity-0 -translate-x-full'
            enterTo='opacity-100 translate-x-0'
            leave='transform transition-all ease-in duration-200'
            leaveFrom='opacity-100 translate-x-0'
            leaveTo='opacity-0 -translate-x-full'
          >
            <div className='fixed left-0 top-0 z-overlay h-full transform'>
              <Nav
                isLocalMode={cms.api?.tina?.isLocalMode}
                toggleMenu={toggleMenu}
                showCollections={isTinaAdminEnabled}
                collectionsInfo={collectionsInfo}
                screens={activeScreens}
                cloudConfigs={allConfigs}
                contentCreators={contentCreators}
                sidebarWidth={sidebarWidth}
                RenderNavSite={({ view }) => (
                  <SidebarSiteLink
                    view={view}
                    onClick={() => {
                      setActiveView(view);
                      setMenuIsOpen(false);
                    }}
                  />
                )}
                RenderNavCloud={({ config }) => (
                  <SidebarCloudLink config={config} />
                )}
                RenderNavCollection={({ collection }) => (
                  <SidebarCollectionLink
                    onClick={() => {
                      setMenuIsOpen(false);
                    }}
                    collection={collection}
                  />
                )}
                AuthRenderNavCollection={({ collection }) => (
                  <SidebarCollectionLink
                    onClick={() => {
                      setMenuIsOpen(false);
                    }}
                    collection={collection}
                    Icon={ImUsers}
                  />
                )}
              ></Nav>
            </div>
          </TransitionChild>
          <TransitionChild
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-80'
            entered='opacity-80'
            leave='ease-in duration-200'
            leaveFrom='opacity-80'
            leaveTo='opacity-0'
          >
            <div
              onClick={() => {
                setMenuIsOpen(false);
              }}
              className='fixed z-menu inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black'
            />
          </TransitionChild>
        </Transition>
      </>
    </SidebarContext.Provider>
  );
};

const updateBodyDisplacement = ({
  position = 'overlay',
  displayState,
  sidebarWidth,
  resizingSidebar,
}) => {
  const body = document.getElementsByTagName('body')[0];
  const windowWidth = window.innerWidth;

  if (position === 'displace') {
    // Padding can't be animated smoothly, so we're using a delay to time the size change
    body.style.transition = resizingSidebar
      ? ''
      : displayState === 'fullscreen'
        ? 'padding 0ms 150ms'
        : displayState === 'closed'
          ? 'padding 0ms 0ms'
          : 'padding 0ms 300ms';

    if (displayState === 'open') {
      const bodyDisplacement = Math.min(
        sidebarWidth,
        windowWidth - minPreviewWidth
      );
      body.style.paddingLeft = `${bodyDisplacement}px`;
    } else {
      body.style.paddingLeft = '0';
    }
  } else {
    body.style.transition = '';
    body.style.paddingLeft = '0';
  }
};

const SidebarHeader = ({ branchingEnabled, isLocalMode }) => {
  const { toggleSidebarOpen, toggleMenu } = React.useContext(SidebarContext);

  return (
    <>
      <div className='p-2 flex-grow-0 w-full'>
        {!isLocalMode && <BillingWarning />}

        <div className='w-full flex justify-between items-center'>
          <div className='flex'>
            <button
              className='p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
              onClick={toggleMenu}
              title='Open navigation menu'
              aria-label='Open navigation menu'
            >
              <BiMenu className='h-6 w-auto text-gray-600' />
            </button>

            <BranchButton />

            <div className='px-4'>
              <LocalWarning />
            </div>
          </div>

          <div className='flex'>
            <BranchPreviewButton />

            <button
              className='p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
              onClick={toggleSidebarOpen}
              title='Close sidebar'
              aria-label='Close sidebar'
            >
              <PiSidebarSimpleLight className='h-6 w-auto text-gray-600' />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarSiteLink = ({
  view,
  onClick,
}: {
  view: ScreenPlugin;
  onClick: () => void;
}) => {
  return (
    <button
      className='text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100'
      value={view.name}
      onClick={onClick}
    >
      <view.Icon className='mr-2 h-6 opacity-80 w-auto' /> {view.name}
    </button>
  );
};

const SidebarCloudLink = ({ config }: { config: CloudConfigPlugin }) => {
  if (config.text) {
    return (
      <span className='text-base tracking-wide text-gray-500 flex items-center opacity-90'>
        {config.text}{' '}
        <a
          target='_blank'
          className='ml-1 text-blue-600 hover:opacity-60'
          href={config.link.href}
        >
          {config.link.text}
        </a>
      </span>
    );
  }
  return (
    <span className='text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100'>
      <config.Icon className='mr-2 h-6 opacity-80 w-auto' />
      <a target='_blank' href={config.link.href}>
        {config.link.text}
      </a>
    </span>
  );
};

const SidebarCollectionLink = ({
  Icon = ImFilesEmpty,
  collection,
  onClick,
}: {
  Icon?: IconType;
  collection: {
    label: string;
    name: string;
  };
  onClick: () => void;
}) => {
  const cms = useCMS();
  const tinaPreview = cms.flags.get('tina-preview') || false;
  return (
    <a
      onClick={onClick}
      href={`${
        tinaPreview ? `/${tinaPreview}/index.html#` : '/admin#'
      }/collections/${collection.name}/~`}
      className='text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100'
    >
      <Icon className='mr-2 h-6 opacity-80 w-auto' />{' '}
      {collection.label ? collection.label : collection.name}
    </a>
  );
};

const EditButton = ({}) => {
  const { displayState, toggleSidebarOpen } = React.useContext(SidebarContext);

  return (
    <Button
      rounded='right'
      variant='secondary'
      size='custom'
      onClick={toggleSidebarOpen}
      className={`z-chrome absolute top-6 right-0 translate-x-full text-sm h-10 px-3 transition-all duration-300 ${
        displayState !== 'closed'
          ? 'opacity-0 ease-in pointer-events-none'
          : 'ease-out pointer-events-auto'
      }`}
      aria-label='opens cms sidebar'
    >
      <PiSidebarSimpleLight className='h-6 w-auto' />
    </Button>
  );
};

const SidebarWrapper = ({ children }) => {
  const { displayState, sidebarWidth, resizingSidebar } =
    React.useContext(SidebarContext);

  return (
    <div
      className={`fixed top-0 left-0 h-dvh z-base ${
        displayState === 'closed' ? 'pointer-events-none' : ''
      }`}
    >
      <div
        className={`relative h-dvh transform flex ${
          displayState !== 'closed' ? '' : '-translate-x-full'
        } ${
          resizingSidebar
            ? 'transition-none'
            : displayState === 'closed'
              ? 'transition-all duration-300 ease-in'
              : displayState === 'fullscreen'
                ? 'transition-all duration-150 ease-out'
                : 'transition-all duration-300 ease-out'
        }`}
        style={{
          width: displayState === 'fullscreen' ? '100vw' : `${sidebarWidth}px`,
          maxWidth:
            displayState === 'fullscreen' ? '100vw' : 'calc(100vw - 8px)',
          minWidth: '360px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const SidebarBody = ({ children }) => {
  return (
    <div
      className={
        'relative left-0 w-full h-full flex flex-col items-stretch bg-gray-50 border-r border-gray-200 overflow-hidden'
      }
    >
      {children}
    </div>
  );
};
