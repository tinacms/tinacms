// custom typefaces
const React = require('react')
const { CMSContext, CMS } = require('@forestryio/cms')

let cms = new CMS()
cms.forms.addFieldPlugin({
  name: 'text',
  Component: ({ field, input, meta }) => {
    return React.createElement(
      'label',
      {
        htmlFor: input.name,
      },
      field.name,
      React.createElement('input', input)
    )
  },
})

export const wrapRootElement = ({ element }) => {
  return React.createElement(
    CMSContext.Provider,
    {
      value: cms,
    },
    element
  )
}
