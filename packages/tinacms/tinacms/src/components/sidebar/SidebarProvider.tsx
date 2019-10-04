import * as React from 'react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (_isOpen: boolean) => void
}

export const SidebarContext = React.createContext<SidebarProps | null>(null)

export function useSidebar(): SidebarProps {
  const sidebar = React.useContext(SidebarContext)

  if (!sidebar) {
    throw new Error('No Sidebar context provided')
  }

  return sidebar
}
