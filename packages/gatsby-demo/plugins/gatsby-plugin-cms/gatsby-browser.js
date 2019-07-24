// custom typefaces
const React = require("react")
const { CMSContext, CMS } = require("@forestryio/cms")

let cms = new CMS()
cms.forms.addFieldPlugin({
  name: "text",
  Component: ({ field, input, meta }) => {
    return (
      <label>
        {field.name} <input {...input} />
      </label>
    )
  },
})

export const wrapRootElement = ({ element }) => {
  return <CMSContext.Provider value={cms}>{element}</CMSContext.Provider>
}
