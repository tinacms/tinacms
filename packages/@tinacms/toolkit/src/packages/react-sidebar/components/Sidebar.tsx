/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'

import { BiMenu, BiPencil } from 'react-icons/bi'
import { BsArrowsAngleContract, BsArrowsAngleExpand } from 'react-icons/bs'
import { ScreenPlugin, ScreenPluginModal } from '../../react-screens'
import { SidebarState, SidebarStateOptions } from '../sidebar'
import { useCMS, useSubscribable } from '../../react-core'
import { useEffect, useState } from 'react'

import { Button } from '../../styles'
import { FormsView } from './SidebarBody'
import { ImFilesEmpty } from 'react-icons/im'
import { IoMdClose } from 'react-icons/io'
import { LocalWarning } from './LocalWarning'
import { MdOutlineArrowBackIos } from 'react-icons/md'
import { Nav } from './Nav'
import { ResizeHandle } from './ResizeHandle'
import { Transition } from '@headlessui/react'
import { useWindowWidth } from '@react-hook/window-size'

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
  defaultState = defaultSidebarState,
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
      // @ts-ignore
      defaultState={cms?.sidebar?.defaultState || defaultState}
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

type displayStates = 'closed' | 'open' | 'fullscreen'

const useFetchCollections = (cms) => {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchCollections = async () => {
      if (await cms.api.admin.isAuthenticated()) {
        try {
          const collections = await cms.api.admin.fetchCollections()
          setCollections(collections)
        } catch (error) {
          setCollections([])
          throw new Error(
            `[${error.name}] GetCollections failed: ${error.message}`
          )
        }

        setLoading(false)
      }
    }

    if (cms.api.admin) {
      setLoading(true)
      fetchCollections()
    }
  }, [cms.api.admin])

  return { collections, loading }
}

const Sidebar = ({
  sidebar,
  defaultWidth,
  defaultState,
  position,
  renderNav,
  resizingSidebar,
  setResizingSidebar,
}: SidebarProps) => {
  const cms = useCMS()
  const collectionsInfo = useFetchCollections(cms)

  const screens = cms.plugins.getType<ScreenPlugin>('screen')
  useSubscribable(sidebar)
  useSubscribable(screens)
  const allScreens = screens.all()

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [activeScreen, setActiveView] = useState<ScreenPlugin | null>(null)
  const [displayState, setDisplayState] =
    React.useState<displayStates>(defaultState)
  const [sidebarWidth, setSidebarWidth] = React.useState<any>(defaultWidth)
  const [formIsPristine, setFormIsPristine] = React.useState(true)

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
        setDisplayState(defaultState)
      }
    }
  }, [defaultState])

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
    if (displayState === 'closed') {
      setDisplayState('open')
    } else {
      setDisplayState('closed')
    }
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
              showCollections={isTinaAdminEnabled}
              collectionsInfo={collectionsInfo}
              screens={allScreens}
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
                  className="rounded-r-md"
                  showCollections={isTinaAdminEnabled}
                  collectionsInfo={collectionsInfo}
                  screens={allScreens}
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
                      <IoMdClose className="h-6 w-auto" />
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
    // Transition displacement when not dragging sidebar (opening/closing sidebar)
    if (!resizingSidebar) {
      body.style.transition = 'all 200ms ease-out'
    } else {
      body.style.transition = ''
    }

    if (displayState === 'open') {
      const bodyDisplacement = Math.min(
        sidebarWidth,
        windowWidth - minPreviewWidth
      )
      body.style.paddingLeft = bodyDisplacement - 6 + 'px'
    } else {
      body.style.paddingLeft = '0'
    }
  } else {
    body.style.transition = ''
    body.style.paddingLeft = '0'
  }
}

const SidebarHeader = ({ renderNav, displayNav, isLocalMode }) => {
  const { toggleFullscreen, displayState, setMenuIsOpen, toggleSidebarOpen } =
    React.useContext(SidebarContext)

  const displayMenuButton = renderNav && !displayNav

  return (
    <div className="flex-grow-0 w-full overflow-visible z-20">
      {isLocalMode && <LocalWarning />}
      <div className="mt-4 -mb-14 w-full flex items-center justify-between pointer-events-none">
        {displayMenuButton && (
          <Button
            rounded="right"
            variant="secondary"
            onClick={() => {
              setMenuIsOpen(true)
            }}
            className="pointer-events-auto -ml-px"
          >
            <BiMenu className="h-7 w-auto" />
          </Button>
        )}
        <div className="flex-1"></div>
        <div
          className={`flex items-center gap-2 pointer-events-auto transition-opacity duration-150 ease-in-out -mr-px`}
        >
          <Button
            rounded="full"
            variant="ghost"
            onClick={toggleFullscreen}
            className="pointer-events-auto opacity-50 hover:opacity-100 focus:opacity-80"
          >
            {displayState === 'fullscreen' ? (
              <BsArrowsAngleContract className="h-5 w-auto -mx-1" />
            ) : (
              <BsArrowsAngleExpand className="h-5 w-auto -mx-1" />
            )}
          </Button>
          <Button
            rounded="left"
            variant="secondary"
            onClick={toggleSidebarOpen}
            aria-label="closes cms sidebar"
            className={``}
          >
            <MdOutlineArrowBackIos className="h-6 w-auto" />
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
      }/collections/${collection.name}`}
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
      onClick={toggleSidebarOpen}
      className={` absolute top-8 right-0 transition-all duration-150 ease-out ${
        displayState !== 'closed'
          ? 'opacity-0'
          : 'translate-x-full pointer-events-auto'
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
  const { displayState } = React.useContext(SidebarContext)

  return (
    <div
      className={`relative left-0 w-full h-full flex flex-col items-stretch bg-white shadow-2xl overflow-hidden transition-opacity duration-300 ease-out ${
        displayState !== 'closed' ? 'opacity-100' : 'opacity-0'
      } ${displayState === 'fullscreen' ? '' : 'rounded-r-md'}`}
    >
      {children}
    </div>
  )
}
