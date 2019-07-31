// custom typefaces
import "typeface-montserrat"
import "typeface-merriweather"
import { TextInput, TextAreaInput } from "@forestryio/xeditor-react"
import * as React from "react"
import { useCMS } from "@forestryio/cms-react"

export const wrapPageElement = ({ element }) => {
  return <FieldRegistrar>{element}</FieldRegistrar>
}

let firstRender = true
const FieldRegistrar = ({ children }) => {
  const cms = useCMS()

  React.useEffect(() => {
    if (firstRender) {
      cms.forms.addFieldPlugin({
        name: "text",
        Component: TextInput,
      })
      cms.forms.addFieldPlugin({
        name: "textarea",
        Component: TextAreaInput,
      })
    }
    firstRender = false
  }, [])

  return children
}
