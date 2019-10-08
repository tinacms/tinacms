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
import { EditorView } from 'prosemirror-view'
import { Plugin } from '@tinacms/core'

import { createEditorState } from './state'
import { useProsemirrorSchema } from './useProsemirrorSchema'
import { useMarkdownTranslator } from './useMarkdownTranslator'
import { nodeViews } from './node-views'

export interface Input {
  value: string
  onChange(value: string): void
  onFocus(): void
  onBlur(): void
}

export function useTinaProsemirror(
  input: Input,
  plugins: Plugin[] = [],
  frame?: any
) {
  /**
   * Construct the Prosemirror Schema
   */
  const [schema] = useProsemirrorSchema(plugins)

  /**
   * Create a MarkdownTranslattor based on the schema
   */
  const [translator] = useMarkdownTranslator(schema)

  /**
   * A reference to the DOM Node where the prosemirror editor will be added.
   */
  const [el, setEl] = React.useState<Node>()

  const elRef = React.useCallback((nextEl: Node) => {
    if (nextEl !== el) {
      setEl(nextEl)
    }
  }, [])

  /**
   * CreateState
   */
  const createState = React.useCallback((value: string) => {
    return createEditorState(schema, translator, plugins, value, frame)
  }, [])

  /**
   * The Prosemirror EditorView instance
   */
  const [editorView, setEditorView] = React.useState<EditorView>()
  const [focussed, setFocus] = React.useState(false)

  React.useEffect(
    function setupEditor() {
      /**
       * Exit early if the target Node has not yet been set.
       */
      if (!el) {
        return
      }

      /**
       * Create a new Prosemirror EditorView on in the DOM
       */
      const editorView = new EditorView(el, {
        nodeViews,
        /**
         * The initial state of the Wysiwyg
         */
        state: createState(input.value),
        /**
         * Call input.onChange with the translated content after updating
         * the Prosemiror state.
         * @param tr
         */
        dispatchTransaction(tr) {
          const nextState: any = editorView.state.apply(tr as any)

          editorView.updateState(nextState as any)

          if (tr.docChanged) {
            input.onChange(translator!.stringFromNode(tr.doc))
          }
        },
        handleDOMEvents: {
          focus: () => {
            setFocus(true)
            input.onFocus()
            return true
          },
          blur: () => {
            setFocus(false)
            input.onBlur()
            return true
          },
        },
      })

      setEditorView(editorView)
      /**
       * Destroy the EditorView to prevent duplicates
       */
      return () => {
        setEditorView(undefined)
        editorView.destroy()
      }
    },
    /**
     * Rerender if the target Node has changed.
     */
    [el]
  )

  React.useEffect(() => {
    /**
     * The editorView may exist, even if it's docView does not.
     * Trying to updateState when the docView dne throws an error.
     */
    // @ts-ignore This exists. Types are lying.
    if (editorView && editorView.docView && !focussed) {
      editorView.updateState(createState(input.value))
    }
  }, [input.value, editorView, focussed])

  return elRef
}
