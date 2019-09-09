import * as React from 'react'
import { defaultBlockSchema } from './schema'
import { MarkdownTranslator, Translator } from './Translator'
import { EditorView } from 'prosemirror-view'
import { createEditorState } from './state'

let schema = defaultBlockSchema
let translator = MarkdownTranslator.fromSchema(schema, {})

export function Wysiwyg({ input }: any) {
  const prosemirrorEl = React.useRef<any>(null)

  React.useEffect(
    function setupEditor() {
      if (!prosemirrorEl.current) return

      new EditorView(prosemirrorEl.current, {
        state: createEditorState(schema, translator, input.value),
      })
    },
    [prosemirrorEl.current]
  )

  return (
    <div>
      <h2>Wysiwyg</h2>
      <div ref={prosemirrorEl} />
    </div>
  )
}
