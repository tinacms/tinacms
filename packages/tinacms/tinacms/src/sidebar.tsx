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
              {cms.plugins.all('content-button').map(plugin => (
                <CreateContentButton plugin={plugin} />
              ))}
              <MenuList>
                {cms.screens.all().map(view => (
                  <MenuLink value={view.name} onClick={() => {
                    setActiveView(view)
                    setMenuVisibility(false)
                  }}>{view.name}</MenuLink>
                ))}
              </MenuList>
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
const HeaderHeight = 4
const Padding = 1.25

const MenuList = styled.div`
  margin: 2rem -${Padding}rem 2rem -${Padding}rem;
  display: block;
`

const MenuLink = styled.div<{ value: string }>`
  color: #F2F2F2;
  font-size: 1.125rem;
  font-weight: 500;
  padding: ${Padding}rem;
  position: relative;
  cursor: pointer;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #3E3E3E;
    opacity: 0;
    z-index: -1;
    transition: all 75ms ease-out;
  }
  &:hover {
    &:after {
      opacity: 1;
    }
  }
`

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
  padding: 0.75rem ${Padding}rem;
  border-bottom: 1px solid rgba(51, 51, 51, 0.09);
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
  width: 1.25rem;
  height: ${HeaderHeight}rem;
  background-image: url(${p => (p.open ? CloseIcon : HamburgerMenu)});
  background-position: center left;
  background-repeat: no-repeat;
  background-size: ${p => (p.open ? '90%' : '100%')} auto;
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
  hr {
    border-color: #F2F2F2;
    color: #F2F2F2;
    margin-bottom: 1.5rem;
    margin-left: -${Padding}rem;
    margin-right: -${Padding}rem;
    border-top: 1px solid #F2F2F2;
  }
`

const FieldsWrapper = styled.div`
  position: absolute;
  left: 0;
  top: ${HeaderHeight}rem;
  height: calc(100vh - (${HeaderHeight}rem));
  width: 100%;
  overflow: hidden;
  padding: ${Padding}rem;
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
  padding: ${Padding}rem;
  transition: all 150ms ease-out;
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
      <CreateButton onClick={() => setOpen(p => !p)}>{plugin.name}</CreateButton>
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

const CreateButton = styled.button`
  text-align: center;
  width: 100%;
  border: 0;
  border-radius: 0.3rem;
  box-shadow: 0px 2px 3px rgba(48,48,48,0.15);
  background-color: #0085ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.75rem;
  transition: opacity 85ms;
  &:hover {
    opacity: 0.6;
  }
`