import * as React from 'react'
import { Sidebar } from './sidebar'
import styled, { css, ThemeProvider } from 'styled-components'
import { Theme, RootElement } from './Globals'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (_isOpen: boolean) => void
}

const SidebarContext = React.createContext<SidebarProps | null>(null)

export const SidebarProvider: React.FC = ({ ...sidebar }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const props = {
    isOpen,
    setIsOpen,
  }

  return (
    <SidebarContext.Provider value={props}>
      <ThemeProvider theme={Theme}>
        <>
          <RootElement />
          <Sidebar open={isOpen} {...sidebar} />
        </>
      </ThemeProvider>
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
