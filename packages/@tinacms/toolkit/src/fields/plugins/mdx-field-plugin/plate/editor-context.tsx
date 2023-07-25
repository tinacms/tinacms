import React from 'react'
import type { MdxTemplate } from './types'

export const EditorContext = React.createContext<{
  fieldName: string
  templates: MdxTemplate[]
  rawMode: boolean
  setRawMode: (mode: boolean) => void
}>({
  fieldName: '',
  rawMode: false,
  setRawMode: () => {},
  templates: [],
})
export const useEditorContext = () => {
  return React.useContext(EditorContext)
}

export const useTemplates = () => {
  return React.useContext(EditorContext)
}
