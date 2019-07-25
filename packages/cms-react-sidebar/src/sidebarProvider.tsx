import * as React from 'react'
import { Sidebar } from './sidebar'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (_isOpen: boolean) => void
}

const SidebarContext = React.createContext<SidebarProps | null>(null)

export const SidebarProvider = ({ children }: { children: any }) => {
  const [isOpen, setIsOpen] = React.useState(true)

  const props = {
    isOpen,
    setIsOpen,
  }

  return (
    <SidebarContext.Provider value={props}>
      {isOpen && <Sidebar>Sidebar</Sidebar>}
      {children}
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
