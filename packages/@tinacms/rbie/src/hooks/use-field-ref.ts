import * as React from 'react'
import { useCMS, useCMSEvent } from 'tinacms'

export const useFieldRef = (formId: string, fieldName: string) => {
  const [node, setNode] = React.useState(null) as any
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
        node.style.opacity = '0.0'
      } else {
        node.style.opacity = initialOpacity
      }
    },
    [node, formId, fieldName]
  )

  const handleClick = React.useCallback(
    (e: React.MouseEvent<any>) => {
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
    (e: React.MouseEvent<any>) => {
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
    (e: React.MouseEvent<any>) => {
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
