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
      <SidebarLayoutContainer>
        <Sidebar title={title} logo={logo} open={isOpen} />
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

const SidebarLayoutContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  height: 100vh;
`

const SiteContainer = styled.div`
  z-index: 0;
  overflow-y: auto;
  position: relative;
  flex: 1 0 auto;
`
