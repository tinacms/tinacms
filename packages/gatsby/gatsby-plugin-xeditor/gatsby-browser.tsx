import * as React from 'react'
import { CMSContext } from '@forestryio/cms-react'
import { SidebarProvider, useSidebar } from '@forestryio/xeditor'
import { cms } from './index'

export const wrapRootElement = ({ element }: any, options: any) => {
  return (
    <CMSContext.Provider value={cms}>
      <SidebarProvider title={options.title} logo={options.logo}>
        {element}
        <SidebarToggle />
      </SidebarProvider>
    </CMSContext.Provider>
  )
}

function SidebarToggle() {
  let sidebar = useSidebar()

  return (
    <div style={{ top: 0, right: 0, padding: '2rem', position: 'fixed' }}>
      <button onClick={() => sidebar.setIsOpen(!sidebar.isOpen)}>
        {sidebar.isOpen ? 'Close' : 'Open'}CMS
      </button>
    </div>
  )
}
