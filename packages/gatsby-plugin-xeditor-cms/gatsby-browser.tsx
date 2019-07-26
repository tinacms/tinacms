import * as React from 'react'
import { CMS } from '@forestryio/cms'
import { CMSContext } from '@forestryio/cms-react'
import { SidebarProvider, useSidebar } from '@forestryio/xeditor-react'

let cms = new CMS()
cms.forms.addFieldPlugin({
  name: 'text',
  Component: ({ field, input, meta }: any) => {
    return (
      <label htmlFor={input.name}>
        {field.name}
        <input {...input} />
      </label>
    )
  },
})

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
