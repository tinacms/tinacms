import * as React from 'react'
import { CMSContext, CMS } from '@forestryio/cms'

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
