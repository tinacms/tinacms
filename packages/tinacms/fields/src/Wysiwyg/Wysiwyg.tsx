import * as React from 'react'
import { defaultBlockSchema } from './schema'
import { MarkdownTranslator, Translator } from './Translator'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'

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

export function createEditorState(
  schema: Schema,
  translator: Translator,
  value: string
) {
  return EditorState.create({
    schema,
    doc: translator.nodeFromString(value),
    plugins: [
      // inputRules(schema),
      // keymap(schema, blockContent),
      // history(),
      // links(schema),
      // dropCursor({ width: 2, color: "rgb(33, 224, 158)" }),
      // gapCursor(),
      // menu(store, translator, !fullsize, format),
    ],
  })
}
