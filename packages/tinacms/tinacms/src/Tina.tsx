import * as React from 'react'
import { CMSContext } from '@tinacms/react-tinacms'
import { ModalProvider } from './modalProvider'
import { SidebarProvider, useSidebar } from './sidebarProvider'
import { cms } from './index'
import styled from 'styled-components'

export const Tina: React.FC = ({ children }) => {
  return (
    <CMSContext.Provider value={cms}>
      <ModalProvider>
        <SidebarProvider>
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
    <EditorToggle
      open={sidebar.isOpen}
      onClick={() => sidebar.setIsOpen(!sidebar.isOpen)}
    />
  )
}

const OpenIcon = require('../assets/pen.svg')
const CloseIcon = require('../assets/times.svg')

const EditorToggle = styled.button<{ open: Boolean }>`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  height: 3rem;
  width: 3rem;
  border: 0;
  outline: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #0084ff;
  background-image: url(${p => (p.open ? CloseIcon : OpenIcon)});
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
