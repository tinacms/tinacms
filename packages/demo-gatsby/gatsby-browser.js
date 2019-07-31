// custom typefaces
import "typeface-montserrat"
import "typeface-merriweather"
import { TextInput } from "@forestryio/xeditor-react"
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
    }
    firstRender = false
  }, [])

  return children
}
