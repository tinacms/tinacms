import * as React from 'react'

export const SidebarManager = ({ children }: { children: any }) => {
  const [showSidebar, setShowSidebar] = React.useState(false)
  return (
    <>
      {showSidebar && <div>Sidebar</div>}
      {children}
    </>
  )
}
