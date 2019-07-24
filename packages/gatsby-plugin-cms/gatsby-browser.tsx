import * as React from 'react'
import { CMS } from '@forestryio/cms'
import { CMSContext } from '@forestryio/cms-react'

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
  return <CMSContext.Provider value={cms}>{element}</CMSContext.Provider>
}
