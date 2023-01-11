/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import { useCMS, useCMSEvent } from '@einsteinindustries/tinacms'

export const useFieldRef = (formId: string, fieldName: string) => {
  const [node, setNode] = React.useState<HTMLElement | null>(null)
  const [initialOpacity, setInitialOpacity] = React.useState('1.0')

  const cms = useCMS() // this is one instance where we need an "anywhere event bus" https://github.com/tinacms/rfcs/blob/ddb360eec21f91f1331ee18f49fc64cc4a69a2e7/0013-tina-anywhere.md#event-bus-as-the-primary-thing-doer

  React.useEffect(() => {
    cms.events.dispatch({
      type: `form:${formId}:ref:${fieldName}`,
      field: fieldName,
      form: formId,
      node,
    })
    if (node) {
      setInitialOpacity(node.style.opacity || '1.0')
    }
  }, [node])

  useCMSEvent(
    `form:${formId}:fields:*:focus`,
    ({ field }) => {
      if (field === fieldName) {
        node!.style.opacity = '0.0'
      } else {
        node!.style.opacity = initialOpacity
      }
    },
    [node, formId, fieldName]
  )

  const handleClick = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      cms.events.dispatch({
        type: `form:${formId}:fields:${fieldName}:focus`,
        form: formId,
        field: fieldName,
      })
    },
    [cms.events, formId, fieldName]
  )

  const handleHoverStart = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      cms.events.dispatch({
        type: `form:${formId}:fields:${fieldName}:attentionStart`,
        form: formId,
        field: fieldName,
      })
    },
    [cms.events, formId, fieldName]
  )

  const handleHoverEnd = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      cms.events.dispatch({
        type: `form:${formId}:fields:${fieldName}:attentionEnd`,
        form: formId,
        field: fieldName,
      })
    },
    [cms.events, formId, fieldName]
  )

  React.useEffect(() => {
    if (!node) return

    if (cms.enabled) {
      node.addEventListener('click', handleClick)
      node.addEventListener('mouseover', handleHoverStart)
      node.addEventListener('mouseout', handleHoverEnd)
    }
    return () => {
      node.removeEventListener('click', handleClick)
      node.removeEventListener('mouseover', handleHoverStart)
      node.removeEventListener('mouseout', handleHoverEnd)
    }
  }, [node, cms.enabled, handleClick, handleHoverStart, handleHoverEnd])

  return React.useCallback((newNode: HTMLElement | null) => {
    setNode(newNode)
  }, [])
}
