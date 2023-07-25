import * as React from 'react'
import { useRef, useEffect } from 'react'

export interface DismissibleProps {
  /**
   * The function that called in response to a dismissal.
   */
  onDismiss: Function

  /**
   * If `true`, pressing `ESC` key will trigger a dismissal. Default: `false`
   */
  escape?: boolean

  /**
   * When `true` clicking outside of the surrounding area triggers a dismissal. Default: `false`
   */
  click?: boolean

  /**
   * When `true` there will be no dismissals. Default: `false`
   */
  disabled?: boolean

  /**
   * An extra Document to add the event listeners too.
   *
   * Used when the dismissible area is inside of an iframe.
   */
  document?: Document

  /**
   * Adding this flag allows click events outside of the
   * dismissible area to propagate to their intended target.
   */
  allowClickPropagation?: boolean
}

export const Dismissible: React.FC<DismissibleProps> = ({
  onDismiss,
  escape,
  click,
  disabled,
  allowClickPropagation,
  document,
  ...props
}) => {
  const area = useDismissible({
    onDismiss,
    escape,
    click,
    disabled,
    allowClickPropagation,
    document,
  })
  return <div ref={area} {...props} />
}

export function useDismissible({
  onDismiss,
  escape = false,
  click = false,
  disabled = false,
  allowClickPropagation = false,
  document: customDocument,
}: DismissibleProps) {
  const area: any = useRef()

  useEffect(() => {
    const documents: any[] = customDocument
      ? [document, customDocument]
      : [document]

    const stopAndPrevent = (event: MouseEvent) => {
      event.stopPropagation()
      event.stopImmediatePropagation()
      event.preventDefault()
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (disabled) return

      if (!area.current.contains(event.target)) {
        console.log('did not click main content', event.target, area.current)
        if (!allowClickPropagation) {
          stopAndPrevent(event)
        }
        onDismiss(event)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (disabled) return

      if (event.keyCode === 27) {
        event.stopPropagation()
        onDismiss(event)
      }
    }

    if (click) {
      documents.forEach((document) =>
        document.body.addEventListener('click', handleDocumentClick)
      )
    }

    if (escape) {
      documents.forEach((document) =>
        document.addEventListener('keydown', handleEscape)
      )
    }
    // Clean up event listeners on unmount
    return () => {
      documents.forEach((document) => {
        document.body.removeEventListener('click', handleDocumentClick)
        document.removeEventListener('keydown', handleEscape)
      })
    }
  }, [click, customDocument, escape, disabled, onDismiss])

  return area
}
