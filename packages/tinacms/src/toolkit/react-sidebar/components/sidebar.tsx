/**



*/

import * as React from 'react'

import { BiExpandAlt, BiLinkExternal, BiMenu, BiPencil } from 'react-icons/bi'
import { ScreenPlugin, ScreenPluginModal } from '@toolkit/react-screens'
import { SidebarState, SidebarStateOptions } from '../sidebar'
import { useCMS, useSubscribable } from '@toolkit/react-core'
import { useState } from 'react'

import { Button } from '@toolkit/styles'
import { FormsView } from './sidebar-body'
import { ImFilesEmpty } from 'react-icons/im'
import { IoMdClose } from 'react-icons/io'
import { BillingWarning, LocalWarning } from './local-warning'
import { MdOutlineArrowBackIos } from 'react-icons/md'
import { Nav } from './nav'
import { ResizeHandle } from './resize-handle'
import { Transition } from '@headlessui/react'
import { useWindowWidth } from '@react-hook/window-size'
import { CloudConfigPlugin } from '@toolkit/react-cloud-config'
import { BranchButton } from '@toolkit/plugin-branch-switcher'

export const SidebarContext = React.createContext<any>(null)

export const minPreviewWidth = 440
export const minSidebarWidth = 360
export const navBreakpoint = 1000

const LOCALSTATEKEY = 'tina.sidebarState'
const LOCALWIDTHKEY = 'tina.sidebarWidth'

const defaultSidebarWidth = 440
const defaultSidebarPosition = 'displace'
const defaultSidebarState = 'open'

export interface SidebarProviderProps {
  sidebar: SidebarState
  resizingSidebar: boolean
  setResizingSidebar: React.Dispatch<React.SetStateAction<boolean>>
  defaultWidth?: SidebarStateOptions['defaultWidth']
  position?: SidebarStateOptions['position']
  defaultState?: SidebarStateOptions['defaultState']
}

export function SidebarProvider({
  position = defaultSidebarPosition,
  resizingSidebar,
  setResizingSidebar,
  defaultWidth = defaultSidebarWidth,
  sidebar,
}: SidebarProviderProps) {
  useSubscribable(sidebar)
  const cms = useCMS()
  if (!cms.enabled) return null

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
  )
}

interface SidebarProps {
  sidebar: SidebarState
  resizingSidebar: boolean
  setResizingSidebar: React.Dispatch<React.SetStateAction<boolean>>
  defaultWidth?: SidebarStateOptions['defaultWidth']
  defaultState?: SidebarStateOptions['defaultState']
  position?: SidebarStateOptions['position']
  renderNav?: boolean
}

const useFetchCollections = (cms) => {
  return { collections: cms.api.admin.fetchCollections(), loading: false }
}

const Sidebar = ({
  sidebar,
  defaultWidth,
  // defaultState,
  position,
  renderNav,
  resizingSidebar,
  setResizingSidebar,
}: SidebarProps) => {
  const cms = useCMS()
  const collectionsInfo = useFetchCollections(cms)

  const [branchingEnabled, setBranchingEnabled] = React.useState(() =>
    cms.flags.get('branch-switcher')
  )
  React.useEffect(() => {
    cms.events.subscribe('flag:set', ({ key, value }) => {
      if (key === 'branch-switcher') {
        setBranchingEnabled(value)
      }
    })
  }, [cms.events])

  const screens = cms.plugins.getType<ScreenPlugin>('screen')
  const cloudConfigs = cms.plugins.getType<CloudConfigPlugin>('cloud-config')

  useSubscribable(sidebar)
  useSubscribable(screens)
  const allScreens = screens.all()
  const allConfigs = cloudConfigs.all()

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [activeScreen, setActiveView] = useState<ScreenPlugin | null>(null)
  const [sidebarWidth, setSidebarWidth] = React.useState<any>(defaultWidth)
  const [formIsPristine, setFormIsPristine] = React.useState(true)

  const setDisplayState = (value: 'closed' | 'fullscreen' | 'open') =>
    cms.dispatch({ type: 'sidebar:set-display-state', value: value })
  const displayState = cms.state.sidebarDisplayState

  /* Set sidebar open state and width to local values if available */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localSidebarState = window.localStorage.getItem(LOCALSTATEKEY)
      const localSidebarWidth = window.localStorage.getItem(LOCALWIDTHKEY)

      if (localSidebarState !== null) {
        setDisplayState(JSON.parse(localSidebarState))
      }

      if (localSidebarWidth !== null) {
        setSidebarWidth(JSON.parse(localSidebarWidth))
      }
    }
  }, [])

  /* If the default sidebar state changes, update current state if no local value is found */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localSidebarState = window.localStorage.getItem(LOCALSTATEKEY)

      if (localSidebarState === null) {
        setDisplayState(defaultSidebarState)
      }
    }
  }, [defaultSidebarState])

  /* Update the local value of the sidebar state any time it updates, if the CMS is loaded */
  React.useEffect(() => {
    if (typeof window !== 'undefined' && cms.enabled) {
      window.localStorage.setItem(LOCALSTATEKEY, JSON.stringify(displayState))
    }
  }, [displayState, cms])

  /* Update the local value of the sidebar width any time the user drags to resize it */
  React.useEffect(() => {
    if (resizingSidebar) {
      window.localStorage.setItem(LOCALWIDTHKEY, JSON.stringify(sidebarWidth))
    }
  }, [sidebarWidth, resizingSidebar])

  const isTinaAdminEnabled =
    cms.flags.get('tina-admin') === false ? false : true

  /**
   * Only show ContentCreators when TinaAdmin is disabled
   */
  const contentCreators = isTinaAdminEnabled
    ? []
    : cms.plugins.getType('content-creator').all()

  const toggleFullscreen = () => {
    if (displayState === 'fullscreen') {
      setDisplayState('open')
    } else {
      setDisplayState('fullscreen')
    }
  }

  const toggleSidebarOpen = () => {
    cms.dispatch({ type: 'toggle-edit-state' })
  }

  const toggleMenu = () => {
    setMenuIsOpen((menuIsOpen) => !menuIsOpen)
  }

  React.useEffect(() => {
    const updateLayout = () => {
      if (displayState === 'fullscreen') {
        return
      }
      updateBodyDisplacement({
        position,
        displayState,
        sidebarWidth,
        resizingSidebar,
      })
    }

    updateLayout()

    window.addEventListener('resize', updateLayout)

    return () => {
      window.removeEventListener('resize', updateLayout)
    }
  }, [displayState, position, sidebarWidth, resizingSidebar])

  const windowWidth = useWindowWidth()
  const displayNav =
    renderNav &&
    ((sidebarWidth > navBreakpoint && windowWidth > navBreakpoint) ||
      (displayState === 'fullscreen' && windowWidth > navBreakpoint))
  const renderMobileNav =
    renderNav &&
    (sidebarWidth < navBreakpoint + 1 || windowWidth < navBreakpoint + 1)

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
        <SidebarWrapper>
          <EditButton />
          {displayNav && (
            <Nav
              isLocalMode={cms.api?.tina?.isLocalMode}
              showCollections={isTinaAdminEnabled}
              collectionsInfo={collectionsInfo}
              screens={allScreens}
              cloudConfigs={allConfigs}
              contentCreators={contentCreators}
              sidebarWidth={sidebarWidth}
              RenderNavSite={({ view }) => (
                <SidebarSiteLink
                  view={view}
                  onClick={() => {
                    setActiveView(view)
                    setMenuIsOpen(false)
                  }}
                />
              )}
              RenderNavCloud={({ config }) => (
                <SidebarCloudLink config={config} />
              )}
              RenderNavCollection={({ collection }) => (
                <SidebarCollectionLink
                  onClick={() => {
                    setMenuIsOpen(false)
                  }}
                  collection={collection}
                />
              )}
            />
          )}
          <SidebarBody>
            <SidebarHeader
              displayNav={displayNav}
              renderNav={renderNav}
              isLocalMode={cms.api?.tina?.isLocalMode}
              branchingEnabled={branchingEnabled}
            />
            <FormsView>
              <sidebar.placeholder />
            </FormsView>
            {activeScreen && (
              <ScreenPluginModal
                screen={activeScreen}
                close={() => setActiveView(null)}
              />
            )}
          </SidebarBody>
          <ResizeHandle />
        </SidebarWrapper>
        {renderMobileNav && (
          <Transition show={menuIsOpen}>
            <Transition.Child
              as={React.Fragment}
              enter="transform transition-all ease-out duration-300"
              enterFrom="opacity-0 -translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="transform transition-all ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 -translate-x-full"
            >
              <div className="fixed left-0 top-0 z-overlay h-full transform">
                <Nav
                  isLocalMode={cms.api?.tina?.isLocalMode}
                  className="rounded-r-md"
                  showCollections={isTinaAdminEnabled}
                  collectionsInfo={collectionsInfo}
                  screens={allScreens}
                  cloudConfigs={allConfigs}
                  contentCreators={contentCreators}
                  sidebarWidth={sidebarWidth}
                  RenderNavSite={({ view }) => (
                    <SidebarSiteLink
                      view={view}
                      onClick={() => {
                        setActiveView(view)
                        setMenuIsOpen(false)
                      }}
                    />
                  )}
                  RenderNavCloud={({ config }) => (
                    <SidebarCloudLink config={config} />
                  )}
                  RenderNavCollection={({ collection }) => (
                    <SidebarCollectionLink
                      onClick={() => {
                        setMenuIsOpen(false)
                      }}
                      collection={collection}
                    />
                  )}
                >
                  <div className="absolute top-8 right-0 transform translate-x-full overflow-hidden">
                    <Button
                      rounded="right"
                      variant="secondary"
                      onClick={() => {
                        setMenuIsOpen(false)
                      }}
                      className={`transition-opacity duration-150 ease-out`}
                    >
                      <IoMdClose className="h-5 w-auto text-blue-500" />
                    </Button>
                  </div>
                </Nav>
              </div>
            </Transition.Child>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-80"
              entered="opacity-80"
              leave="ease-in duration-200"
              leaveFrom="opacity-80"
              leaveTo="opacity-0"
            >
              <div
                onClick={() => {
                  setMenuIsOpen(false)
                }}
                className="fixed z-menu inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
              ></div>
            </Transition.Child>
          </Transition>
        )}
      </>
    </SidebarContext.Provider>
  )
}

export const updateBodyDisplacement = ({
  position = 'overlay',
  displayState,
  sidebarWidth,
  resizingSidebar,
}) => {
  const body = document.getElementsByTagName('body')[0]
  const windowWidth = window.innerWidth

  if (position === 'displace') {
    // Padding can't be animated smoothly, so we're using a delay to time the size change
    body.style.transition = resizingSidebar
      ? ''
      : displayState === 'fullscreen'
      ? 'padding 0ms 150ms'
      : displayState === 'closed'
      ? 'padding 0ms 0ms'
      : 'padding 0ms 300ms'

    if (displayState === 'open') {
      const bodyDisplacement = Math.min(
        sidebarWidth,
        windowWidth - minPreviewWidth
      )
      body.style.paddingLeft = bodyDisplacement + 'px'
    } else {
      body.style.paddingLeft = '0'
    }
  } else {
    body.style.transition = ''
    body.style.paddingLeft = '0'
  }
}

const SidebarHeader = ({
  branchingEnabled,
  renderNav,
  displayNav,
  isLocalMode,
}) => {
  const { toggleFullscreen, displayState, setMenuIsOpen, toggleSidebarOpen } =
    React.useContext(SidebarContext)

  const displayMenuButton = renderNav && !displayNav

  const cms = useCMS()
  const previewFunction = cms.api?.tina?.schema?.config?.config?.ui?.previewUrl
  const branch = cms.api?.tina?.branch
  const previewUrl =
    typeof previewFunction === 'function'
      ? previewFunction({ branch })?.url
      : null

  return (
    <div className="flex-grow-0 w-full overflow-visible z-20">
      {isLocalMode && <LocalWarning />}
      {!isLocalMode && <BillingWarning />}

      <div className="mt-4 -mb-14 w-full flex gap-3 items-center justify-between pointer-events-none">
        {displayMenuButton && (
          <Button
            rounded="right"
            variant="white"
            onClick={() => {
              setMenuIsOpen(true)
            }}
            className="pointer-events-auto -ml-px"
          >
            <BiMenu className="h-6 w-auto text-blue-500" />
          </Button>
        )}
        <div className="flex-1 flex gap-3 items-center shrink min-w-0">
          {branchingEnabled && !isLocalMode && <BranchButton />}
          {branchingEnabled && !isLocalMode && previewUrl && (
            <button
              className="pointer-events-auto flex min-w-0	shrink gap-1 items-center justify-between form-select text-sm h-10 px-4 shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100 transition-color duration-150 ease-out rounded-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight min-w-[5rem]"
              onClick={() => {
                window.open(previewUrl, '_blank')
              }}
            >
              <BiLinkExternal className="flex-shrink-0 w-4 h-auto text-blue-500/70 mr-1" />
              <span className="truncate max-w-full min-w-0 shrink">
                Preview
              </span>
            </button>
          )}
        </div>
        <div
          className={`flex items-center pointer-events-auto transition-opacity duration-150 ease-in-out -mr-px`}
        >
          <Button
            rounded="left"
            variant="white"
            onClick={toggleSidebarOpen}
            aria-label="closes cms sidebar"
            className="-mr-px"
          >
            <MdOutlineArrowBackIos className="h-[18px] w-auto -mr-1 text-blue-500" />
          </Button>
          <Button rounded="custom" variant="white" onClick={toggleFullscreen}>
            {displayState === 'fullscreen' ? (
              // BiCollapseAlt
              <svg
                className="h-5 w-auto -mx-1 text-blue-500"
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 15h7v7h2v-9H2v2zM15 2h-2v9h9V9h-7V2z"></path>
              </svg>
            ) : (
              <BiExpandAlt className="h-5 -mx-1 w-auto text-blue-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const SidebarSiteLink = ({
  view,
  onClick,
}: {
  view: ScreenPlugin
  onClick: () => void
}) => {
  return (
    <button
      className="text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100"
      value={view.name}
      onClick={onClick}
    >
      <view.Icon className="mr-2 h-6 opacity-80 w-auto" /> {view.name}
    </button>
  )
}

const SidebarCloudLink = ({ config }: { config: CloudConfigPlugin }) => {
  if (config.text) {
    return (
      <span className="text-base tracking-wide text-gray-500 flex items-center opacity-90">
        {config.text}{' '}
        <a
          target="_blank"
          className="ml-1 text-blue-600 hover:opacity-60"
          href={config.link.href}
        >
          {config.link.text}
        </a>
      </span>
    )
  }
  return (
    <span className="text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100">
      <config.Icon className="mr-2 h-6 opacity-80 w-auto" />
      <a target="_blank" href={config.link.href}>
        {config.link.text}
      </a>
    </span>
  )
}

const SidebarCollectionLink = ({
  collection,
  onClick,
}: {
  collection: {
    label: string
    name: string
  }
  onClick: () => void
}) => {
  const cms = useCMS()
  const tinaPreview = cms.flags.get('tina-preview') || false
  return (
    <a
      onClick={onClick}
      href={`${
        tinaPreview ? `/${tinaPreview}/index.html#` : '/admin#'
      }/collections/${collection.name}/~`}
      className="text-base tracking-wide text-gray-500 hover:text-blue-600 flex items-center opacity-90 hover:opacity-100"
    >
      <ImFilesEmpty className="mr-2 h-6 opacity-80 w-auto" />{' '}
      {collection.label ? collection.label : collection.name}
    </a>
  )
}

const EditButton = ({}) => {
  const { displayState, toggleSidebarOpen } = React.useContext(SidebarContext)

  return (
    <Button
      rounded="right"
      variant="primary"
      size="custom"
      onClick={toggleSidebarOpen}
      className={`z-chrome absolute top-6 right-0 translate-x-full text-sm h-10 pl-3 pr-4 transition-all duration-300 ${
        displayState !== 'closed'
          ? 'opacity-0 ease-in pointer-events-none'
          : 'ease-out pointer-events-auto'
      }`}
      aria-label="opens cms sidebar"
    >
      <BiPencil className="h-6 w-auto" />
    </Button>
  )
}

const SidebarWrapper = ({ children }) => {
  const { displayState, sidebarWidth, resizingSidebar } =
    React.useContext(SidebarContext)

  return (
    <div
      className={`fixed top-0 left-0 h-screen z-base ${
        displayState === 'closed' ? `pointer-events-none` : ``
      }`}
    >
      <div
        className={`relative h-screen transform flex ${
          displayState !== 'closed' ? `` : `-translate-x-full`
        } ${
          resizingSidebar
            ? `transition-none`
            : displayState === 'closed'
            ? `transition-all duration-300 ease-in`
            : displayState === 'fullscreen'
            ? `transition-all duration-150 ease-out`
            : `transition-all duration-300 ease-out`
        }`}
        style={{
          width: displayState === 'fullscreen' ? '100vw' : sidebarWidth + 'px',
          maxWidth:
            displayState === 'fullscreen' ? '100vw' : 'calc(100vw - 8px)',
          minWidth: '360px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

const SidebarBody = ({ children }) => {
  return (
    <div
      className={`relative left-0 w-full h-full flex flex-col items-stretch bg-white border-r border-gray-200 overflow-hidden`}
    >
      {children}
    </div>
  )
}
