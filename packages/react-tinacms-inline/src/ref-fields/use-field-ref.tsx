import * as React from 'react'
import { useInlineForm } from 'inline-form'

export function useFieldRef(fieldName: string) {
  const ref = React.useRef()
  const { fieldRefActions } = useInlineForm()
  fieldRefActions.set(fieldName, ref)
  return ref
}
