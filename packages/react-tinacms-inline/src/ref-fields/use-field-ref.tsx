import * as React from 'react'
import { useInlineForm } from 'inline-form'

export type FieldRefType = React.RefObject<HTMLElement | null>

export function useFieldRef(fieldName: string) {
  const ref: FieldRefType = React.useRef(null)
  const { fieldRefActions } = useInlineForm()
  React.useEffect(() => {
    fieldRefActions.set(fieldName, ref)
  }, [fieldName, ref])

  return ref
}
