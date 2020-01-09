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
import { useRef, useEffect } from 'react'

export interface Props {
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
}

export const Dismissible: React.FC<Props> = ({
  onDismiss,
  escape = false,
  click = false,
  disabled = false,
  document: customDocument,
  ...props
}) => {
  const area: any = useRef()
  const documents: any[] = customDocument
    ? [document, customDocument]
    : [document]

  useEffect(() => {
    const stopAndPrevent = (event: MouseEvent) => {
      event.stopPropagation()
      event.stopImmediatePropagation()
      event.preventDefault()
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (disabled) return

      if (!area.current.contains(event.target)) {
        stopAndPrevent(event)
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
      documents.forEach(document =>
        document.body.addEventListener('click', handleDocumentClick)
      )
    }

    if (escape) {
      documents.forEach(document =>
        document.addEventListener('keydown', handleEscape)
      )
    }
    // Clean up event listeners on unmount
    return () => {
      documents.forEach(document => {
        document.body.removeEventListener('click', handleDocumentClick)
        document.removeEventListener('keydown', handleEscape)
      })
    }
  }, [click, document, customDocument, escape, disabled, onDismiss])

  return <div ref={area} {...props} />
}
