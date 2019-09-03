import * as React from 'react'
import { Sidebar } from './sidebar'
import styled from 'styled-components'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (_isOpen: boolean) => void
}

const SidebarContext = React.createContext<SidebarProps | null>(null)

export const SidebarProvider: React.FC<{ title?: string; logo?: string }> = ({
  children,
  title,
  logo,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const props = {
    isOpen,
    setIsOpen,
  }

  return (
    <SidebarContext.Provider value={props}>
      <SidebarLayoutContainer isSidebarOpen={isOpen}>
        {isOpen ? <Sidebar title={title} logo={logo} /> : <div />}
        <SiteContainer>{children}</SiteContainer>
      </SidebarLayoutContainer>
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarProps {
  let sidebar = React.useContext(SidebarContext)

  if (!sidebar) {
    throw new Error('No Sidebar context provided')
  }

  return sidebar
}

interface SidebarLayoutContainerProps {
  isSidebarOpen: boolean
}

const sidebarWidth = 340
const SidebarLayoutContainer = styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: ${(props: SidebarLayoutContainerProps) =>
      props.isSidebarOpen ? sidebarWidth : 0}px calc(
      100% -
        ${(props: SidebarLayoutContainerProps) =>
          props.isSidebarOpen ? sidebarWidth : 0}px
    );
`

const SiteContainer = styled.div`
  overflow-y: scroll;
  z-index: 0;
`
