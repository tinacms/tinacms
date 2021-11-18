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
import styled, { keyframes, css, createGlobalStyle } from 'styled-components'
import { FormsView } from './SidebarBody'
import { HamburgerIcon, LeftArrowIcon, EditIcon, TinaIcon } from '../../icons'
import { tina_reset_styles } from '../../styles'
import { CreateContentMenu } from '../../react-forms'
import { ScreenPlugin, ScreenPluginModal } from '../../react-screens'
import { useSubscribable, useCMS } from '../../react-core'
import { ResizeHandle } from './ResizeHandle'
import { SidebarState, SidebarPosition, SidebarStateOptions } from '../sidebar'

export interface SidebarProviderProps {
  children: any
  sidebar: SidebarState
  position?: SidebarStateOptions['position']
}

export function SidebarProvider({
  children,
  position,
  sidebar,
}: SidebarProviderProps) {
  useSubscribable(sidebar)
  const cms = useCMS()

  return (
    <>
      {isFixed(position || sidebar.position) ? (
        <SiteWrapper open={sidebar.isOpen}>{children}</SiteWrapper>
      ) : (
        children
      )}
      {cms.enabled && <Sidebar sidebar={sidebar} />}
    </>
  )
}

interface SidebarProps {
  sidebar: SidebarState
}

const Sidebar = ({ sidebar }: SidebarProps) => {
  const cms = useCMS()
  const screens = cms.plugins.getType<ScreenPlugin>('screen')
  useSubscribable(sidebar)
  useSubscribable(screens)
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [activeScreen, setActiveView] = useState<ScreenPlugin | null>(null)
  const allScreens = screens.all()
  const showMenu = allScreens.length > 0

  return (
    <>
      <SidebarGlobalStyles />
      <SidebarContainer open={sidebar.isOpen}>
        <SidebarWrapper open={sidebar.isOpen}>
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
          <ResizeHandle />
        </SidebarWrapper>
        <SidebarToggle sidebar={sidebar} />
      </SidebarContainer>
    </>
  )
}

const SidebarGlobalStyles = createGlobalStyle`
  @media (max-width: 500px) {
    :root {
      --tina-sidebar-width: calc(100vw - 64px);
    }
  }
`

const SiteWrapper = styled.div<{ open: boolean }>`
  @media (min-width: 840px) {
    padding-left: ${(props) =>
      props.open ? 'var(--tina-sidebar-width)' : '0'};
    transition: padding-left 150ms ease-out;
  }
`

function isFixed(position: SidebarPosition): boolean {
  return position === 'fixed' || position === 'displace'
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
  return (
    <SidebarToggleButton
      onClick={() => (sidebar.isOpen = !sidebar.isOpen)}
      open={sidebar.isOpen}
      aria-label="toggles cms sidebar"
    >
      {sidebar.isOpen ? <LeftArrowIcon /> : <EditIcon />}
    </SidebarToggleButton>
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

const SidebarHeader = styled.div`
  display: grid;
  grid-template-areas: 'hamburger actions';
  align-items: center;
  z-index: var(--tina-z-index-5);
  height: var(--tina-sidebar-header-height);
  width: 100%;
  padding: 0 var(--tina-padding-big);
`

const MenuToggle = styled.button<{ open: boolean }>`
  padding: 0 0 0 var(--tina-padding-big);
  margin-left: calc(var(--tina-padding-big) * -1);
  background: transparent;
  outline: none;
  border: 0;
  text-align: left;
  width: 64px;
  height: 32px;
  grid-area: hamburger;
  justify-self: start;
  cursor: pointer;
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

const SidebarToggleAnimation = keyframes`
  from {
    transform: translate3d(-100%,0,0);
  }

  to {
    transform: translate3d(0,0,0);
  }
`

const SidebarToggleButton = styled.button<{ open: boolean }>`
  position: absolute;
  pointer-events: all;
  bottom: 44px;
  left: var(--tina-sidebar-width);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 0 24px 24px 0;
  width: 50px;
  height: 44px;
  border: 0;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  fill: white;
  text-align: center;
  background-color: var(--tina-color-primary);
  background-repeat: no-repeat;
  background-position: center;
  transition: background-color 150ms ease-out;
  cursor: pointer;
  animation: ${SidebarToggleAnimation} 200ms 300ms ease-out 1 both;
  &:hover {
    background-color: var(--tina-color-primary-light);
  }
  &:active {
    background-color: var(--tina-color-primary-dark);
  }
`

const SidebarWrapper = styled.div<{ open: boolean }>`
  margin: 0;
  padding: 0;
  border: 0;
  z-index: 1;
  background-color: white;
  position: fixed;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  width: var(--tina-sidebar-width);
  overflow: visible;
  height: 100%;
  left: 0;
  top: 0;

  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  &:before {
    /* Animate box-shadow with opacity for better performance */
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.07), 2px 0 8px rgba(0, 0, 0, 0.07);
    transition: all ${(p) => (p.open ? 150 : 200)}ms ease-out;
    opacity: ${(p) => (p.open ? 1 : 0)};
  }
  &:after {
    /* Overlay outer border */
    border-right: 1px solid rgba(51, 51, 51, 0.09);
  }
`

const SidebarContainer = styled.div<{ open: boolean }>`
  ${tina_reset_styles}

  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  display: block !important;
  background: transparent !important;
  height: 100% !important;
  width: var(--tina-sidebar-width) !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  box-sizing: border-box;
  z-index: var(--tina-z-index-4);
  transition: all ${(p) => (p.open ? 150 : 200)}ms ease-out !important;
  transform: translate3d(
    ${(p) => (p.open ? '0' : 'calc(var(--tina-sidebar-width) * -1)')},
    0,
    0
  ) !important;
  pointer-events: ${(p) => (p.open ? `all` : `none`)};
`
