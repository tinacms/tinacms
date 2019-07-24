// custom typefaces
import "typeface-montserrat"
import "typeface-merriweather"
import React from "react"
import { CMSContext, CMS } from "@forestryio/cms"

let cms = new CMS()
cms.forms.addFieldPlugin({
  name: "text",
  Component: ({ field, input, meta }) => {
    return (
      <label>
        {field.name}
        <input {...input} />
      </label>
    )
  },
})

export const wrapRootElement = ({ element }) => {
  return <CMSContext.Provider value={cms}>{element}</CMSContext.Provider>
}
