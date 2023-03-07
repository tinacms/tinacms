/**

*/

import React from 'react'
import type { MdxTemplate } from './types'

export const EditorContext = React.createContext<{
  templates: MdxTemplate[]
  rawMode: boolean
  setRawMode: (mode: boolean) => void
}>({
  rawMode: false,
  setRawMode: () => {},
  templates: [],
})
export const useEditorContext = () => {
  return React.useContext(EditorContext)
}

export const useTemplates = () => {
  const { templates } = React.useContext(EditorContext)

  return templates
}
