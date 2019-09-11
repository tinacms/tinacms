import * as React from 'react'
import { CMSContext } from '@tinacms/react-tinacms'
import { ModalProvider } from './modalProvider'
import { SidebarProvider, useSidebar } from './sidebarProvider'
import { cms } from './index'
import styled from 'styled-components'
import { Close, Edit } from '@tinacms/icons'
import { StyledFrame } from './styled-frame'

export const Tina: React.FC = ({ children, ...sidebar }) => {
  return (
    <CMSContext.Provider value={cms}>
      <ModalProvider>
        <SidebarProvider {...sidebar}>
          {children}
          <SidebarToggle />
        </SidebarProvider>
      </ModalProvider>
    </CMSContext.Provider>
  )
}

function SidebarToggle() {
  let sidebar = useSidebar()

  return (
    <StyledFrame
      frameStyles={{
        position: 'fixed',
        right: '32px',
        bottom: '32px',
        height: '48px',
        width: '48px',
        borderRadius: '8px',
        boxShadow: '0px 2px 3px rgba(48, 48, 48, 0.15)',
        zIndex: 999999,
        margin: 0,
        border: 0,
      }}
    >
      <EditorToggle
        open={sidebar.isOpen}
        onClick={() => sidebar.setIsOpen(!sidebar.isOpen)}
      />
    </StyledFrame>
  )
}

const EditorToggle = styled(props => {
  return <button {...props}>{props.open ? <Close /> : <Edit />}</button>
})`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  transition: background 0.35s ease;
  cursor: pointer;
  &:hover {
    background-color: #4ea9ff;
  }
  &:active {
    background-color: #0073df;
  }
`
