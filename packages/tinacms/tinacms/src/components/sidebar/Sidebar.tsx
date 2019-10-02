import * as React from 'react'
import { useSubscribable } from '@tinacms/react-tinacms'
import { useState } from 'react'
import { StyledFrame, useFrameContext } from '../SyledFrame'
import styled, { keyframes, css } from 'styled-components'
import { FormsView } from '../FormView'
import { Modal } from '../modals/ModalProvider'
import { ModalFullscreen } from '../modals/ModalFullscreen'
import {
  CloseIcon,
  HamburgerIcon,
  LeftArrowIcon,
  EditIcon,
  AddIcon,
} from '@tinacms/icons'
import { GlobalStyles, padding, color, TinaResetStyles } from '@tinacms/styles'
import {
  SIDEBAR_WIDTH,
  TOGGLE_WIDTH,
  Z_INDEX,
  SIDEBAR_HEADER_HEIGHT,
} from '../../Globals'
import { Button } from '../Button'
import { CreateContentButton } from '../CreateContent'
import { useSidebar } from './SidebarProvider'
import { ScreenPlugin } from '../../plugins/screen-plugin'
import { useTina } from '../../hooks/use-tina'
import { Dismissible } from 'react-dismissible'

export const Sidebar = () => {
  const frame = useFrameContext()
  const cms = useTina()
  const sidebar = useSidebar()
  useSubscribable(cms.screens)
  const [menuIsVisible, setMenuVisibility] = useState(false)
  const [ActiveView, setActiveView] = useState<ScreenPlugin | null>(null)
  let [visible, setVisible] = React.useState(false)

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
              {menuIsVisible ? <CloseIcon /> : <HamburgerIcon />}
            </MenuToggle>

            <ContentMenuWrapper>
              <PlusButton onClick={() => setVisible(true)} open={visible}>
                <AddIcon />
              </PlusButton>
              <ContentMenu open={visible}>
                <Dismissible
                  click
                  escape
                  onDismiss={() => setVisible(false)}
                  document={frame.document}
                  disabled={!visible}
                >
                  {cms.plugins.all('content-button').map(plugin => (
                    <CreateContentButton
                      plugin={plugin}
                      onClick={() => {
                        setVisible(false)
                      }}
                    />
                  ))}
                </Dismissible>
              </ContentMenu>
            </ContentMenuWrapper>
          </SidebarHeader>
          <FormsView />

          <MenuPanel visible={menuIsVisible}>
            <MenuWrapper>
              <MenuList>
                {cms.screens.all().map(view => (
                  <MenuLink
                    value={view.name}
                    onClick={() => {
                      setActiveView(view)
                      setMenuVisibility(false)
                    }}
                  >
                    <CloseIcon /> {view.name}
                  </MenuLink>
                ))}
              </MenuList>
            </MenuWrapper>
          </MenuPanel>
          {ActiveView && (
            <Modal>
              <ModalFullscreen>
                <button onClick={() => setActiveView(null)}>Close Modal</button>
                <ActiveView.Component />
              </ModalFullscreen>
            </Modal>
          )}
        </SidebarWrapper>
      </StyledFrame>
      <SidebarToggle {...sidebar} />
    </SidebarContainer>
  )
}

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

const ContentMenuWrapper = styled.div`
  position: relative;
`

const PlusButton = styled(Button)<{ open: boolean }>`
  border-radius: 10rem;
  padding: 0;
  width: 2rem;
  height: 2rem;
  margin: 0;
  position: relative;
  fill: white;
  transform-origin: 50% 50%;
  transition: all 150ms ease-out;
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 1.5rem;
    height: 1.5rem;
  }
  &:focus {
    outline: none;
  }
  ${props =>
    props.open &&
    css`
      transform: rotate(45deg);
      background-color: white;
      fill: ${color('primary')};
      &:hover {
        background-color: #f6f6f9;
      }
    `};
`

const ContentMenu = styled.div<{ open: boolean }>`
  min-width: 12rem;
  border-radius: 0.5rem;
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0;
  box-shadow: ${p => p.theme.shadow.big};
  background-color: white;
  overflow: hidden;
  z-index: 100;

  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 2.25rem, 0) scale3d(1, 1, 1);
    `};
`

const MenuList = styled.div`
  margin: 2rem -${padding()}rem 2rem -${padding()}rem;
  display: block;
`

const MenuLink = styled.div<{ value: string }>`
  color: ${color('light')};
  font-size: 1.125rem;
  font-weight: 500;
  padding: ${padding()}rem ${padding()}rem ${padding()}rem 4rem;
  position: relative;
  cursor: pointer;
  transition: all ${p => p.theme.timing.short} ease-out;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #3e3e3e;
    z-index: -1;
    transition: transform ${p => p.theme.timing.short} ease-out,
      opacity ${p => p.theme.timing.short} ${p => p.theme.timing.short} ease-out;
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  &:hover {
    color: ${color('primary')};
    &:after {
      transform: translate3d(0, 0, 0);
      transition: transform ${p => p.theme.timing.short} ease-out, opacity 0ms;
      opacity: 1;
    }
    svg {
      fill: ${color('primary')};
    }
    & ~ * {
      &:after {
        transform: translate3d(0, -100%, 0);
      }
    }
  }
  svg {
    position: absolute;
    left: ${padding()}rem;
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 1.75rem;
    height: auto;
    fill: #bdbdbd;
    transition: all ${p => p.theme.timing.short} ease-out;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  z-index: 1050;
  height: ${SIDEBAR_HEADER_HEIGHT}rem;
  width: ${SIDEBAR_WIDTH}px;
  padding: 1rem ${padding()}rem 0 ${padding()}rem;
`

const MenuToggle = styled.button<{ open: boolean }>`
  padding: 0 0 0 ${padding()}rem;
  margin-left: -${padding()}rem;
  background: transparent;
  outline: none;
  border: 0;
  text-align: left;
  width: 4rem;
  height: 2rem;
  transition: all 75ms ease-out;
  fill: ${p => (p.open ? '#F2F2F2' : '#828282')};
  &:hover {
    opacity: 0.6;
    cursor: pointer;
  }
`

const MenuWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: ${SIDEBAR_HEADER_HEIGHT}rem ${padding()}rem ${padding()}rem
    ${padding()}rem;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const MenuPanel = styled.div<{ visible: boolean }>`
  background: ${color('dark')};
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${SIDEBAR_WIDTH}px;
  transform: translate3d(${p => (p.visible ? '0' : '-100%')}, 0, 0);
  overflow: hidden;
  padding: ${padding()}rem;
  transition: all 150ms ease-out;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 0 0 ${p => p.theme.radius.big} ${p => p.theme.radius.big};
  overflow: hidden;
  ${Button} {
    border-radius: 0;
    flex: 1 0 auto;
  }
`

const SidebarToggleAnimation = keyframes`
  from {
    transform: translate3d(-100%,0,0);
  }

  to {
    transform: translate3d(-0.125rem,0,0);
  }
`

const SidebarToggleButton = styled.button<{ open: boolean }>`
  position: fixed;
  top: 0.5rem;
  left: 0;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 0 0.5rem 0.5rem 0;
  width: 3.125rem;
  height: 3rem;
  border: 0;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  fill: white;
  text-align: center;
  background-color: #0084ff;
  background-repeat: no-repeat;
  background-position: center;
  transition: all 150ms ease-out;
  cursor: pointer;
  transform: translate3d(${p => (p.open ? 0 : '-0.125rem')}, 0, 0);
  animation: ${SidebarToggleAnimation} 150ms ease-out 1;
  &:hover {
    background-color: #4ea9ff;
    transform: translate3d(${p => (p.open ? '-0.125rem' : 0)}, 0, 0);
  }
  &:active {
    background-color: #0073df;
  }
`

const SidebarWrapper = styled.div<{ open: boolean }>`
  margin: 0;
  padding: ${SIDEBAR_HEADER_HEIGHT}rem 0 0 0;
  border: 0;
  z-index: 1;
  background-color: white;
  position: absolute;
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
