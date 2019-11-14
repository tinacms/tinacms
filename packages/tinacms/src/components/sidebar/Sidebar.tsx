/**

Copyright 2019 Forestry.io Inc

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
import { useSubscribable } from 'react-tinacms'
import { useState } from 'react'
import { StyledFrame } from '../SyledFrame'
import styled, { keyframes, css } from 'styled-components'
import { FormsView } from '../FormView'
import { Modal, ModalHeader, ModalBody } from '../modals/ModalProvider'
import { ModalFullscreen } from '../modals/ModalFullscreen'
import { ModalPopup } from '../modals/ModalPopup'
import {
  HamburgerIcon,
  LeftArrowIcon,
  EditIcon,
  TinaIcon,
  CloseIcon,
} from '@tinacms/icons'
import {
  GlobalStyles,
  padding,
  color,
  radius,
  font,
  timing,
} from '@tinacms/styles'
import {
  SIDEBAR_WIDTH,
  TOGGLE_WIDTH,
  Z_INDEX,
  SIDEBAR_HEADER_HEIGHT,
} from '../../Globals'
import { CreateContentMenu } from '../CreateContent'
import { useSidebar } from './SidebarProvider'
import { ScreenPlugin } from '../../plugins/screen-plugin'
import { useTina } from '../../hooks/use-tina'

export const Sidebar = () => {
  const cms = useTina()
  const sidebar = useSidebar()
  useSubscribable(cms.screens)
  const [menuIsVisible, setMenuVisibility] = useState(false)
  const [ActiveView, setActiveView] = useState<ScreenPlugin | null>(null)

  return (
    <SidebarContainer open={sidebar.isOpen}>
      <StyledFrame
        id="sidebar-frame"
        frameStyles={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: SIDEBAR_WIDTH + 8 + 'px',
          height: '100%',
          margin: '0',
          padding: '0',
          border: '0',
          pointerEvents: sidebar.isOpen ? 'all' : 'none',
        }}
      >
        <SidebarWrapper open={sidebar.isOpen}>
          <GlobalStyles />
          <SidebarHeader>
            <MenuToggle
              onClick={() => setMenuVisibility(!menuIsVisible)}
              open={menuIsVisible}
            >
              <HamburgerIcon />
            </MenuToggle>
            <CreateContentMenu />
          </SidebarHeader>
          <FormsView />

          <MenuPanel visible={menuIsVisible}>
            <MenuWrapper>
              <MenuList>
                {cms.screens.all().map(view => {
                  const Icon = view.Icon
                  return (
                    <MenuLink
                      value={view.name}
                      onClick={() => {
                        setActiveView(view)
                        setMenuVisibility(false)
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
          {ActiveView && (
            <ActiveViewModal
              name={ActiveView.name}
              close={() => setActiveView(null)}
              layout={ActiveView.layout}
            >
              <ActiveView.Component />
            </ActiveViewModal>
          )}
        </SidebarWrapper>
      </StyledFrame>
      <SidebarToggle {...sidebar} />
    </SidebarContainer>
  )
}

interface ActiveViewProps {
  children: any
  name: string
  close: any
  layout?: 'fullscreen' | 'popup'
}

const ActiveViewModal = ({
  children,
  name,
  close,
  layout,
}: ActiveViewProps) => {
  let Wrapper

  switch (layout) {
    case 'popup':
      Wrapper = ModalPopup
      break
    case 'fullscreen':
      Wrapper = ModalFullscreen
      break
    default:
      Wrapper = ModalPopup
      break
  }

  return (
    <Modal>
      <Wrapper>
        <ModalHeader>
          {name}
          <CloseButton onClick={close}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </Wrapper>
    </Modal>
  )
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
  bottom: ${padding()};
  left: ${padding()};
  svg {
    width: 8rem;
    height: 8rem;
    margin: -0.25rem -1.25rem;
    fill: ${color.grey(9)};
  }
`

const SidebarToggle = (sidebar: any) => {
  return (
    <StyledFrame
      id="sidebar-frame"
      frameStyles={{
        position: 'absolute',
        left: SIDEBAR_WIDTH + 'px',
        bottom: '32px',
        width: '56px',
        height: '64px',
        margin: '0',
        padding: '0',
        border: '0',
        overflow: 'hidden',
        pointerEvents: 'all',
      }}
    >
      <>
        <GlobalStyles />
        <SidebarToggleButton
          onClick={() => sidebar.setIsOpen(!sidebar.isOpen)}
          open={sidebar.isOpen}
        >
          {sidebar.isOpen ? <LeftArrowIcon /> : <EditIcon />}
        </SidebarToggleButton>
      </>
    </StyledFrame>
  )
}

const MenuList = styled.div`
  margin: 2rem -${padding()} 2rem -${padding()};
  display: block;
`

const MenuLink = styled.div<{ value: string }>`
  color: ${color.grey(1)};
  font-size: ${font.size(4)};
  font-weight: 500;
  padding: ${padding()} ${padding()} ${padding()} 4rem;
  position: relative;
  cursor: pointer;
  transition: all ${timing('short')} ease-out;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    top: 0.5rem;
    bottom: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    border-radius: ${radius()};
    background-color: ${color.grey(9)};
    z-index: -1;
    transition: all 150ms ease;
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  &:hover {
    color: ${color.primary('light')};
    &:after {
      transform: translate3d(0, 0, 0);
      transition: transform ${timing('short')} ease-out, opacity 0ms;
      opacity: 1;
    }
    svg {
      fill: ${color.primary()};
    }
    & ~ * {
      &:after {
        transform: translate3d(0, -100%, 0);
      }
    }
  }
  svg {
    position: absolute;
    left: ${padding()};
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 2.25rem;
    height: auto;
    fill: ${color.grey(4)};
    transition: all ${timing('short')} ease-out;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1050;
  flex: 0 0 ${SIDEBAR_HEADER_HEIGHT}rem;
  height: ${SIDEBAR_HEADER_HEIGHT}rem;
  width: 100%;
  padding: 0 ${padding()};
`

const MenuToggle = styled.button<{ open: boolean }>`
  padding: 0 0 0 ${padding()};
  margin-left: -${padding()};
  background: transparent;
  outline: none;
  border: 0;
  text-align: left;
  width: 4rem;
  height: 2rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  svg {
    position: relative;
    transition: fill 85ms ease-out;
    fill: ${color.grey(6)};
    margin-left: -4px;
    width: 2rem;
    height: auto;
    path {
      position: relative;
      transition: transform 250ms ease-out, opacity 250ms ease-out,
        fill 85ms ease-out;
      transform-origin: 50% 50%;
    }
  }
  &:hover {
    svg {
      fill: ${color.grey(7)};
    }
  }
  ${props =>
    props.open &&
    css`
      svg {
        fill: #f6f6f9;
        &:hover {
          fill: ${color.grey(2)};
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
  padding: ${SIDEBAR_HEADER_HEIGHT}rem ${padding()} ${padding()} ${padding()};
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const MenuPanel = styled.div<{ visible: boolean }>`
  background: ${color.grey(8)};
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${SIDEBAR_WIDTH}px;
  transform: translate3d(${p => (p.visible ? '0' : '-100%')}, 0, 0);
  overflow: hidden;
  padding: ${padding()};
  transition: all 250ms ease-out;
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
  position: fixed;
  top: 0.5rem;
  left: 0;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 0 1.5rem 1.5rem 0;
  width: 3.125rem;
  height: 2.75rem;
  border: 0;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  fill: white;
  text-align: center;
  background-color: ${color.primary()};
  background-repeat: no-repeat;
  background-position: center;
  transition: all 150ms ease-out;
  cursor: pointer;
  animation: ${SidebarToggleAnimation} 200ms 300ms ease-out 1 both;
  &:hover {
    background-color: ${color.primary('light')};
  }
  &:active {
    background-color: ${color.primary('dark')};
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
  width: ${SIDEBAR_WIDTH}px;
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
    transition: all ${p => (p.open ? 150 : 200)}ms ease-out;
    opacity: ${p => (p.open ? 1 : 0)};
  }
  &:after {
    /* Overlay outer border */
    border-right: 1px solid rgba(51, 51, 51, 0.09);
  }
`

const SidebarContainer = styled.div<{ open: boolean }>`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  display: block !important;
  background: transparent !important;
  height: 100% !important;
  width: ${SIDEBAR_WIDTH + TOGGLE_WIDTH}px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  z-index: ${Z_INDEX} !important;
  transition: all ${p => (p.open ? 150 : 200)}ms ease-out !important;
  transform: translate3d(
    ${p => (p.open ? '0' : '-' + SIDEBAR_WIDTH + 'px')},
    0,
    0
  ) !important;
  pointer-events: none;
`

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  fill: ${color.grey(3)};
  cursor: pointer;
  transition: fill 85ms ease-out;
  svg {
    width: 1.5rem;
    height: auto;
  }
  &:hover {
    fill: ${color.grey(8)};
  }
`
