import * as React from 'react'
import { useCMS, useSubscribable } from '@tinacms/react-tinacms'
import { useState } from 'react'
import { StyledFrame } from './styled-frame'
import styled, { ThemeProvider } from 'styled-components'
import { FormsView, SaveButton, CancelButton } from './components/FormView'
import { ScreenPlugin } from '@tinacms/core'
import { Modal, ModalHeader, ModalBody } from './modalProvider'
import { ModalPopup } from './modalPopup'
import { ModalFullscreen } from './modalFullscreen'
import { TextField } from '@tinacms/fields'
import { Close, Hamburger } from '@tinacms/icons'
import {
  Theme,
  RootElement,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
} from './components/Globals'
import { Button } from './components/Button'

export const Sidebar = ({
  title = 'Tina',
  logo = ForestryLogo,
  open = true,
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
    <ThemeProvider theme={Theme}>
      <SidebarContainer open={open}>
        <StyledFrame
          id="sidebar-frame"
          frameStyles={{
            position: 'absolute',
            right: '0',
            top: '0',
            width: '340px',
            height: '100%',
            margin: '0',
            padding: '0',
            border: '0',
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
                    <MenuLink
                      value={view.name}
                      onClick={() => {
                        setActiveView(view)
                        setMenuVisibility(false)
                      }}
                    >
                      <Close /> {view.name}
                    </MenuLink>
                  ))}
                </MenuList>
              </FieldsWrapper>
            </MenuPanel>
            {ActiveView && (
              <Modal>
                <ModalFullscreen>
                  <button onClick={() => setActiveView(null)}>
                    Close Modal
                  </button>
                  <ActiveView.Component />
                </ModalFullscreen>
              </Modal>
            )}
          </>
        </StyledFrame>
      </SidebarContainer>
    </ThemeProvider>
  )
}

const CreateContentButton = ({ plugin }: any) => {
  let cms = useCMS()
  let [postName, setPostName] = React.useState('')
  let [open, setOpen] = React.useState(false)
  return (
    <div>
      <CreateButton onClick={() => setOpen(p => !p)}>
        {plugin.name}
      </CreateButton>
      {open && (
        <Modal>
          <ModalPopup>
            <ModalHeader>{plugin.name}</ModalHeader>
            <ModalBody>
              <TextField
                onChange={e => setPostName(e.target.value)}
                value={postName}
              />
            </ModalBody>
            <ModalActions>
              <SaveButton
                onClick={() => {
                  plugin.onSubmit(postName, cms)
                  setOpen(false)
                }}
              >
                Create
              </SaveButton>
              <CancelButton onClick={() => setOpen(p => !p)}>
                Cancel
              </CancelButton>
            </ModalActions>
          </ModalPopup>
        </Modal>
      )}
    </div>
  )
}

const MenuList = styled.div`
  margin: 2rem -${p => p.theme.padding}rem 2rem -${p => p.theme.padding}rem;
  display: block;
`

const MenuLink = styled.div<{ value: string }>`
  color: #f2f2f2;
  font-size: 1.125rem;
  font-weight: 500;
  padding: ${p => p.theme.padding}rem ${p => p.theme.padding}rem
    ${p => p.theme.padding}rem 4rem;
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
    color: ${p => p.theme.color.primary};
    &:after {
      transform: translate3d(0, 0, 0);
      transition: transform ${p => p.theme.timing.short} ease-out, opacity 0ms;
      opacity: 1;
    }
    svg {
      fill: ${p => p.theme.color.primary};
    }
    & ~ * {
      &:after {
        transform: translate3d(0, -100%, 0);
      }
    }
  }
  svg {
    position: absolute;
    left: ${p => p.theme.padding}rem;
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 1.75rem;
    height: auto;
    fill: #bdbdbd;
    transition: all ${p => p.theme.timing.short} ease-out;
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
  height: ${HEADER_HEIGHT}rem;
  padding: 0.75rem ${p => p.theme.padding}rem;
  border-bottom: 1px solid rgba(51, 51, 51, 0.09);
`

const ForestryLogo = styled.div<{ url: string }>`
  height: ${HEADER_HEIGHT}rem;
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

const ActionsToggle = styled(p => (
  <button {...p}>{p.open ? <Close /> : <Hamburger />}</button>
))`
  padding: 0 ${p => p.theme.padding}rem;
  margin-left: -${p => p.theme.padding}rem;
  background: transparent;
  outline: none;
  border: 0;
  text-align: left;
  width: 3rem;
  height: ${HEADER_HEIGHT}rem;
  transition: all 75ms ease-out;
  fill: ${p => (p.open ? '#F2F2F2' : '#828282')};
  &:hover {
    opacity: 0.6;
    cursor: pointer;
  }
`

const FieldsWrapper = styled.div`
  position: absolute;
  left: 0;
  top: ${HEADER_HEIGHT}rem;
  height: calc(100vh - (${HEADER_HEIGHT}rem));
  width: 100%;
  overflow: hidden;
  padding: ${p => p.theme.padding}rem;
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
  padding: ${p => p.theme.padding}rem;
  transition: all 150ms ease-out;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const CreateButton = styled(Button)`
  width: 100%;
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
