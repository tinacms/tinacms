/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'
import { useInlineForm } from 'inline-form'

export type FieldRefType = React.RefObject<HTMLElement | null>

const outlineCSS = '1px solid rgba(34,150,254, 0.5)'

export function useFieldRef(fieldName: string) {
  const [node, setNode] = React.useState(null) as any

  const { setFocussedField, fieldRefActions } = useInlineForm()

  React.useEffect(() => {
    fieldRefActions.set(fieldName, node)
    if (!node) return

    const handleClick = (e: React.MouseEvent<any>) => {
      e.preventDefault()
      e.stopPropagation()
      setFocussedField(fieldName)
    }
    const beginHover = () => {
      node.style.outline = outlineCSS
    }
    const endHover = () => {
      node.style.outline = 'none'
    }
    node.addEventListener('click', handleClick)
    node.addEventListener('mouseover', beginHover)
    node.addEventListener('mouseout', endHover)
    return () => {
      node.removeEventListener('click', handleClick)
      node.removeEventListener('mouseover', beginHover)
      node.removeEventListener('mouseout', endHover)
    }
  }, [node, fieldRefActions.set])

  return React.useCallback((newNode: HTMLElement | null) => {
    setNode(newNode)
  }, [])
}
