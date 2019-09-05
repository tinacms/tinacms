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
  title = 'Tina',
  logo = ForestryLogo,
  open = true
}: {
  title?: string
  logo?: string
  open?: boolean
}) => {
  const cms = useCMS()
  useSubscribable(cms.screens)
  const [menuIsVisible, setMenuVisibility] = useState(false)
  const [ActiveView, setActiveView] = useState<ScreenPlugin | null>(null)

  return (
    <SidebarContainer open={open}>
      <StyledFrame
        frameStyles={{
          position: 'absolute',
          right: '0',
          top: '0',
          width: '340px',
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
                }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.7032 7.65455L18.4256 11.8839V9.32184L24 3.81029L22.7032 2.52811L18.4256 6.75748V0H16.5926V6.75522L12.3196 2.53037L11.0228 3.81029L16.5926 9.31731V11.8794L12.3196 7.65455L7.39819 2.78862V0H5.56525V2.80221L0 8.3047L1.2968 9.58688L5.56525 5.3643V7.92639L0 13.4311L1.2968 14.7111L5.56525 10.4907V24H7.39819V10.4772L11.6804 14.7111L12.9749 13.4289L7.39819 7.91506V5.35298L11.6804 9.58688V9.58461L16.5926 14.4437V24H18.4256V14.446L24 8.93673L22.7032 7.65455Z"/>
                </svg> {view.name}</MenuLink>
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

const HamburgerMenu = require('../assets/hamburger.svg')
const CloseIcon = require('../assets/close.svg')
const HeaderHeight = 4
const Padding = 1.25

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

const MenuList = styled.div`
  margin: 2rem -${Padding}rem 2rem -${Padding}rem;
  display: block;
`

const MenuLink = styled.div<{ value: string }>`
  color: #F2F2F2;
  font-size: 1.125rem;
  font-weight: 500;
  padding: ${Padding}rem ${Padding}rem ${Padding}rem 4rem;
  position: relative;
  cursor: pointer;
  transition: all 85ms ease-out;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #3E3E3E;
    z-index: -1;
    transition: transform 85ms ease-out, opacity 85ms 85ms ease-out;
    transform: translate3d(0,100%,0);
    opacity: 0;
  }
  &:hover {
    color: #0084FF;
    &:after {
      transform: translate3d(0,0,0);
      transition: transform 85ms ease-out, opacity 0ms;
      opacity: 1;
    }
    svg {
      fill: #0084FF;
    }
    &~*{
      &:after {
        transform: translate3d(0,-100%,0);
      }
    }
  }
  svg {
    position: absolute;
    left: ${Padding}rem;
    top: 50%;
    transform: translate3d(0,-50%,0);
    width: 1.75rem;
    height: auto;
    fill: #BDBDBD;
    transition: all 85ms ease-out;
  }
`

const SidebarContainer = styled.div<{ open: boolean }>`
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  box-shadow: inset -1px 0 0 #efefef;
  z-index: 1;
  background-color: white;
  transition: all ${p => (p.open ? 150 : 200)}ms ease-out;
  transform: translate3d(${p => (p.open ? '0' : '-100%')}, 0, 0);
  position: relative;
  display: block;
  flex: 0 0 ${p => (p.open ? '340px' : '0')};
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
`

const ForestryLogo = styled.div<{ url: string }>`
  height: ${HeaderHeight}rem;
  width: 2rem;
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
  transition: all 75ms ease-out;
  &:hover {
    opacity: 0.6;
    cursor: pointer;
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

const CreateButton = styled.button`
  text-align: center;
  width: 100%;
  border: 0;
  border-radius: 0.5rem;
  box-shadow: 0px 2px 3px rgba(48,48,48,0.15);
  background-color: #0084FF;
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