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
}

export function useTinaProsemirror(
  input: Input,
  plugins: Plugin[] = [],
  frame?: any
): React.RefObject<Node> {
  /**
   * Construct the Prosemirror Schema
   */
  let [schema] = useProsemirrorSchema(plugins)

  /**
   * Create a MarkdownTranslattor based on the schema
   */
  let [translator] = useMarkdownTranslator(schema)

  /**
   * A reference to the DOM Node where the prosemirror editor will be added.
   */
  const targetNode = React.useRef<Node>(null)

  React.useEffect(
    function setupEditor() {
      /**
       * Exit early if the target Node has not yet been set.
       */
      if (!targetNode.current) return

      /**
       * Create a new Prosemirror EditorView on in the DOM
       */
      let editorView = new EditorView(targetNode.current, {
        nodeViews,
        /**
         * The initial state of the Wysiwyg
         */
        state: createEditorState(
          schema,
          translator,
          plugins,
          input.value,
          frame
        ),
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
      })
      /**
       * Destroy the EditorView to prevent duplicates
       */
      return () => editorView.destroy()
    },
    /**
     * Rerender if the target Node has changed.
     */
    [targetNode.current]
  )

  return targetNode
}
