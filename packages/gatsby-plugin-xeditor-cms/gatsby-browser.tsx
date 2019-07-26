import * as React from 'react'
import { CMS } from '@forestryio/cms'
import { CMSContext } from '@forestryio/cms-react'
import { SidebarProvider, TextInput } from '@forestryio/xeditor-react'

let cms = new CMS()
cms.forms.addFieldPlugin({
  name: 'text',
  Component: (props: any) => {
    return <TextInput {...props} />
  },
})

export const wrapRootElement = ({ element }: any) => {
  return (
    <CMSContext.Provider value={cms}>
      <SidebarProvider>{element}</SidebarProvider>
    </CMSContext.Provider>
  )
}
