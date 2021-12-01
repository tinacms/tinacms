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
import { useState } from 'react'
import styled, { css, createGlobalStyle } from 'styled-components'
import { FormsView } from './SidebarBody'
import { HamburgerIcon, LeftArrowIcon, EditIcon, TinaIcon } from '../../icons'
import { Button } from '../../styles'
import { CreateContentMenu } from '../../react-forms'
import { ScreenPlugin, ScreenPluginModal } from '../../react-screens'
import { useSubscribable, useCMS } from '../../react-core'
import { ResizeHandle } from './ResizeHandle'
import { SidebarState, SidebarStateOptions } from '../sidebar'

export const SidebarContext = React.createContext<any>(null)

export const minPreviewWidth = 440
export const minSidebarWidth = 360

export interface SidebarProviderProps {
  sidebar: SidebarState
  defaultWidth?: SidebarStateOptions['defaultWidth']
  position?: SidebarStateOptions['displayMode']
}

export function SidebarProvider({
  position,
  defaultWidth,
  sidebar,
}: SidebarProviderProps) {
  useSubscribable(sidebar)
  const cms = useCMS()

  if (!cms.enabled) return null

  return (
    <Sidebar
      displayMode={position}
      defaultWidth={defaultWidth}
      sidebar={sidebar}
    />
  )
}

interface SidebarProps {
  sidebar: SidebarState
  defaultWidth?: SidebarStateOptions['defaultWidth']
  displayMode?: SidebarStateOptions['displayMode']
}

type displayStates = 'closed' | 'open' | 'fullscreen'

const Sidebar = ({ sidebar, defaultWidth, displayMode }: SidebarProps) => {
  const cms = useCMS()
  const screens = cms.plugins.getType<ScreenPlugin>('screen')
  useSubscribable(sidebar)
  useSubscribable(screens)
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [activeScreen, setActiveView] = useState<ScreenPlugin | null>(null)
  const allScreens = screens.all()
  const showMenu = allScreens.length > 0

  const [displayState, setDisplayState] =
    React.useState<displayStates>('closed')
  const [sidebarWidth, setSidebarWidth] = React.useState<any>(defaultWidth)
  const [previousWidth, setPreviousWidth] = React.useState(defaultWidth)
  const [resizingSidebar, setResizingSidebar] = React.useState(false)

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

  React.useEffect(() => {
    setPreviousWidth(sidebarWidth)
    if (displayState === 'fullscreen') {
      setSidebarWidth(window.innerWidth)
    } else {
      if (previousWidth < window.innerWidth) {
        setSidebarWidth(previousWidth)
      } else {
        setSidebarWidth(window.innerWidth / 2)
      }
    }
  }, [displayState])

  React.useEffect(() => {
    const updateLayout = () => {
      if (displayState === 'fullscreen') {
        return
      }
      if (displayMode === 'displace') {
        updateBodyDisplacement({ displayState, sidebarWidth, resizingSidebar })
      }
    }

    updateLayout()

    window.addEventListener('resize', updateLayout)

    return () => {
      window.removeEventListener('resize', updateLayout)
    }
  }, [displayState, displayMode, sidebarWidth, resizingSidebar])

  return (
    <SidebarContext.Provider
      value={{
        sidebarWidth,
        setSidebarWidth,
        displayState,
        setDisplayState,
        displayMode,
        toggleFullscreen,
        toggleSidebarOpen,
        resizingSidebar,
        setResizingSidebar,
      }}
    >
      <SidebarWrapper>
        <SidebarBody>
          <SidebarHeader>
            {showMenu && (
              <MenuToggle
                onClick={() => setMenuIsOpen(!menuIsOpen)}
                open={menuIsOpen}
              >
                <HamburgerIcon />
              </MenuToggle>
            )}
            <CreateContentMenu sidebar={true} />
          </SidebarHeader>
          <FormsView>
            <sidebar.placeholder />
          </FormsView>
          {showMenu && (
            <MenuPanel visible={menuIsOpen}>
              <MenuWrapper>
                <MenuList>
                  {cms.flags.get('tina-admin') && (
                    <MenuLink
                      key="admin"
                      value="admin"
                      onClick={() => {
                        window.location.href = window.location.origin + '/admin'
                      }}
                    >
                      <TinaIcon /> Tina Admin
                    </MenuLink>
                  )}
                  {allScreens.map((view) => {
                    const Icon = view.Icon
                    return (
                      <MenuLink
                        key={view.name}
                        value={view.name}
                        onClick={() => {
                          setActiveView(view)
                          setMenuIsOpen(false)
                        }}
                      >
                        <Icon /> {view.name}
                      </MenuLink>
                    )
                  })}
                </MenuList>
              </MenuWrapper>
              <Watermark />
            </MenuPanel>
          )}
          {activeScreen && (
            <ScreenPluginModal
              screen={activeScreen}
              close={() => setActiveView(null)}
            />
          )}
        </SidebarBody>
        <ResizeHandle />
        <SidebarToggle sidebar={sidebar} />
      </SidebarWrapper>
    </SidebarContext.Provider>
  )
}

const updateBodyDisplacement = ({
  displayState,
  sidebarWidth,
  resizingSidebar,
}) => {
  const body = document.getElementsByTagName('body')[0]
  const windowWidth = window.innerWidth

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
    body.style.paddingLeft = bodyDisplacement + 'px'
  } else {
    body.style.paddingLeft = '0'
  }
}

const Watermark = styled(({ ...styleProps }: any) => {
  return (
    <div {...styleProps}>
      <TinaIcon />
    </div>
  )
})`
  position: absolute;
  z-index: -1;
  bottom: var(--tina-padding-big);
  left: var(--tina-padding-big);
  svg {
    width: 128px;
    height: 128px;
    margin: -4px -20px;
    fill: var(--tina-color-grey-9);
  }
`

const SidebarToggle = ({ sidebar }: { sidebar: SidebarState }) => {
  const { toggleSidebarOpen } = React.useContext(SidebarContext)

  return (
    <Button
      onClick={toggleSidebarOpen}
      aria-label="toggles cms sidebar"
      primary
      rounded="right"
      size="custom"
      className="absolute bottom-12 right-0 transform translate-x-full pointer-events-auto w-14 h-11"
    >
      {sidebar.isOpen ? <LeftArrowIcon /> : <EditIcon />}
    </Button>
  )
}

const MenuList = styled.div`
  margin: 32px calc(var(--tina-padding-big) * -1) 32px
    calc(var(--tina-padding-big) * -1);
  display: block;
`

const MenuLink = styled.div<{ value: string }>`
  color: var(--tina-color-grey-1);
  font-size: var(--tina-font-size-4);
  font-weight: var(--tina-font-weight-regular);
  padding: var(--tina-padding-big) var(--tina-padding-big)
    var(--tina-padding-big) 64px;
  position: relative;
  cursor: pointer;
  transition: all var(--tina-timing-short) ease-out;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 8px;
    right: 8px;
    border-radius: var(--tina-radius-big);
    background-color: var(--tina-color-grey-9);
    z-index: -1;
    transition: all 150ms ease;
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  &:hover {
    color: var(--tina-color-primary-light);
    &:after {
      transform: translate3d(0, 0, 0);
      transition: transform var(--tina-timing-short) ease-out, opacity 0ms;
      opacity: 1;
    }
    svg {
      fill: var(--tina-color-primary);
    }
    & ~ * {
      &:after {
        transform: translate3d(0, -100%, 0);
      }
    }
  }
  svg {
    position: absolute;
    left: var(--tina-padding-big);
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 36px;
    height: auto;
    fill: var(--tina-color-grey-4);
    transition: all var(--tina-timing-short) ease-out;
  }
`

const SidebarHeader = ({ children }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-30 pointer-events-none">
      {children}
    </div>
  )
}

const MenuToggle = styled.button<{ open: boolean }>`
  padding: 0 0 0 var(--tina-padding-big);
  margin-left: calc(var(--tina-padding-big) * -1);
  background: transparent;
  outline: none;
  border: 0;
  text-align: left;
  width: 64px;
  height: 32px;
  cursor: pointer;
  pointer-events: auto;

  svg {
    position: relative;
    transition: fill 85ms ease-out;
    fill: var(--tina-color-grey-6);
    margin-left: -4px;
    width: 32px;
    height: auto;
    path {
      position: relative;
      transition: transform var(--tina-timing-long) ease-out,
        opacity var(--tina-timing-long) ease-out,
        fill var(--tina-timing-short) ease-out;
      transform-origin: 50% 50%;
    }
  }
  &:hover {
    svg {
      fill: var(--tina-color-grey-7);
    }
  }
  ${(props) =>
    props.open &&
    css<any>`
      svg {
        fill: var(--tina-color-grey-1);
        &:hover {
          fill: var(--tina-color-grey-2);
        }
        path:first-child {
          /* Top bar */
          transform: rotate(45deg) translate3d(0, 0.45rem, 0);
        }
        path:nth-child(2) {
          /* Middle bar */
          transform: translate3d(-100%, 0, 0);
          opacity: 0;
        }
        path:last-child {
          /* Bottom Bar */
          transform: rotate(-45deg) translate3d(0, -0.45rem, 0);
        }
      }
    `};
`

const MenuWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: var(--tina-sidebar-header-height) var(--tina-padding-big)
    var(--tina-padding-big) var(--tina-padding-big);
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const MenuPanel = styled.div<{ visible: boolean }>`
  background: var(--tina-color-grey-8);
  z-index: var(--tina-z-index-4);
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--tina-sidebar-width);
  transform: translate3d(${(p) => (p.visible ? '0' : '-100%')}, 0, 0);
  overflow: hidden;
  padding: var(--tina-padding-big);
  transition: all var(--tina-timing-long) ease-out;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const SidebarWrapper = ({ children }) => {
  const { displayState, sidebarWidth, resizingSidebar } =
    React.useContext(SidebarContext)

  return (
    <div className="fixed top-0 left-0 h-screen" style={{ zIndex: 9999 }}>
      <div
        className={`relative flex h-screen transform ${
          displayState !== 'closed' ? `` : `-translate-x-full`
        } ${
          resizingSidebar
            ? `transition-none`
            : displayState === 'fullscreen'
            ? `transition-all duration-150 ease-out`
            : `transition-all duration-300 ease-out`
        }`}
        style={{
          width: sidebarWidth,
          maxWidth: '100vw',
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
      className={`relative left-0 w-full h-full bg-gray-50 shadow-2xl overflow-hidden transition-opacity duration-300 ease-out ${
        displayState !== 'closed' ? `opacity-100` : `opacity-0`
      } ${displayState === 'fullscreen' ? `` : `rounded-r-md`}`}
    >
      {children}
    </div>
  )
}
