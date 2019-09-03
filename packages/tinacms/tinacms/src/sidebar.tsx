import * as React from 'react'
import { useCMS, useSubscribable } from '@tinacms/react-tinacms'
import { useState } from 'react'
import { StyledFrame } from './styled-frame'
import styled, { createGlobalStyle } from 'styled-components'
import { FormsView, SaveButton } from './components/FormView'
import { ScreenPlugin } from '@tinacms/core'
import { Modal, ModalHeader, ModalBody } from './modalProvider'
import { TextField } from '@tinacms/fields'

export const Sidebar = ({
  title = 'XEditor',
  logo = ForestryLogo,
  open = true,
  width = 340
}: {
  title?: string
  logo?: string
  open?: boolean
  width?: number
}) => {
  const cms = useCMS()
  useSubscribable(cms.screens)
  const [menuIsVisible, setMenuVisibility] = useState(false)
  const [ActiveView, setActiveView] = useState<ScreenPlugin | null>(null)

  return (
    <SidebarContainer open={open} width={width}>
      <StyledFrame
        frameStyles={{
          width: '100%',
          height: '100%',
          margin: '0',
          padding: '0',
          border: '0'
        }}
      >
        <>
          <RootElement />
          <SidebarHeader>
            <ActionsToggle
              onClick={() => setMenuVisibility(!menuIsVisible)}
              open={menuIsVisible}
            />
          </SidebarHeader>
          <FieldsWrapper>
            <FormsView />
          </FieldsWrapper>

          <MenuPanel visible={menuIsVisible}>
            <FieldsWrapper>
              <ul>
                {cms.screens.all().map(view => (
                  <li
                    value={view.name}
                    onClick={() => {
                      setActiveView(view)
                      setMenuVisibility(false)
                    }}
                  >
                    {view.name}
                  </li>
                ))}
                {cms.plugins.all('content-button').map(plugin => (
                  <CreateContentButton plugin={plugin} />
                ))}
              </ul>
            </FieldsWrapper>
          </MenuPanel>
          {ActiveView && (
            <Modal>
              <button onClick={() => setActiveView(null)}>Close Modal</button>
              <ActiveView.Component />
            </Modal>
          )}
        </>
      </StyledFrame>
    </SidebarContainer>
  )
}

const EllipsisVertical = require('../assets/ellipsis-v.svg')
const HamburgerMenu = require('../assets/hamburger.svg')
const CloseIcon = require('../assets/close.svg')
const HeaderHeight = 4.5

const SidebarContainer = styled.div<{ open: boolean, width: number }>`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  border-right: 1px solid #efefef;
  z-index: 1;
  background-color: white;
  transition: transform ${p => (p.open ? 150 : 200)}ms ease-out;
  transform: translate3d(${p => (p.open ? '0' : '-100%')}, 0, 0);
  position: relative;
  display: block;
  width: ${props => props.width || 340}px;
`

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  z-index: 1050;
  left: 0;
  top: 0;
  width: 100%;
  height: ${HeaderHeight}rem;
  padding: 1.25rem;
  /* border-bottom: 1px solid #efefef; */
`

const ForestryLogo = styled.div<{ url: string }>`
  height: ${HeaderHeight}rem;
  width: 2rem;
  /* border-right: 1px solid #efefef; */
  background-image: url(${props => props.url});
  background-size: 2rem;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 1rem;
`

const SiteName = styled.h3`
  font-size: 0.8rem;
  font-weight: 500;
`

const ActionsToggle = styled.button<{ open: boolean }>`
  background: transparent;
  outline: none;
  border: 0;
  width: 1.5rem;
  height: ${HeaderHeight}rem;
  background-image: url(${p => (p.open ? CloseIcon : HamburgerMenu)});
  background-position: center left;
  background-repeat: no-repeat;
  background-size: ${p => (p.open ? '80%' : '100%')} auto;
  transition: all 0.15s ease-out;
  &:hover {
    opacity: 0.6;
    cursor: pointer;
  }
`
const RootElement = createGlobalStyle`
  @import url('https://rsms.me/inter/inter.css');
  html {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    box-sizing: border-box;
  }
  @supports (font-variation-settings: normal) {
    html { font-family: 'Inter var', sans-serif; }
  }
  body {
    margin: 0;
    padding: 0;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`

const FieldsWrapper = styled.div`
  position: absolute;
  left: 0;
  top: ${HeaderHeight}rem;
  height: calc(100vh - (${HeaderHeight}rem));
  width: 100%;
  overflow: hidden;
  padding: 1.25rem;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const MenuPanel = styled.div<{ visible: boolean }>`
  background: #333333;
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  transform: translate3d(${p => (p.visible ? '0' : '-100%')}, 0, 0);
  overflow: hidden;
  padding: 1.25rem;
  transition: all 200ms ease-out;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const CreateContentButton = ({ plugin }: any) => {
  let cms = useCMS()
  let [postName, setPostName] = React.useState('')
  let [open, setOpen] = React.useState(false)
  return (
    <div>
      <button onClick={() => setOpen(p => !p)}>{plugin.name}</button>
      {open && (
        <Modal>
          <ModalHeader>Create</ModalHeader>
          <ModalBody>
            <TextField
              onChange={e => setPostName(e.target.value)}
              value={postName}
            />

            <SaveButton
              onClick={() => {
                plugin.onSubmit(postName, cms)
                setOpen(false)
              }}
            >
              Save
            </SaveButton>
          </ModalBody>
        </Modal>
      )}
    </div>
  )
}
