import * as React from 'react'
import { CMSContext } from '@forestryio/cms-react'
import {
  SidebarProvider,
  useSidebar,
  TextInput,
} from '@forestryio/xeditor-react'
import { cms } from './index'

export const wrapRootElement = ({ element }: any) => {
  return (
    <CMSContext.Provider value={cms}>
      <SidebarProvider>
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
