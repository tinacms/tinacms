// custom typefaces
import "typeface-montserrat"
import "typeface-merriweather"
import { TextInput, TextAreaInput } from "@tinacms/xeditor"
import * as React from "react"
import { useCMS } from "@tinacms/cms-react"

export const wrapPageElement = ({ element }) => {
  return <FieldRegistrar>{element}</FieldRegistrar>
}

let firstRender = true
const FieldRegistrar = ({ children }) => {
  const cms = useCMS()

  React.useEffect(() => {
    if (firstRender) {
      //override any fields here
      // cms.forms.addFieldPlugin({
      //   name: "text",
      //   Component: TextInput,
      // })
      // cms.forms.addFieldPlugin({
      //   name: "textarea",
      //   Component: TextAreaInput,
      // })
    }
    firstRender = false
  }, [])

  return children
}
