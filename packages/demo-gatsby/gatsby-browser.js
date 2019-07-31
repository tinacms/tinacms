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
      cms.forms.addFieldPlugin({
        name: "textarea",
        Component: props => {
          return <textarea {...props.input} />
        },
      })
    }
    firstRender = false
  }, [])

  return children
}
