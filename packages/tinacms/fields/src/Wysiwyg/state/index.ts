import { Schema } from 'prosemirror-model'
import { EditorState, Plugin } from 'prosemirror-state'
// @ts-ignore
import { dropCursor } from 'prosemirror-dropcursor'
// @ts-ignore
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'

import { keymap } from './plugins/keymap'
import { inputRules } from './plugins/input-rules'
import { Translator } from '../Translator'
import { menu } from './plugins/Menu'

export function createEditorState(
  schema: Schema,
  translator: Translator,
  plugins: Plugin<any>[],
  value: string
) {
  return EditorState.create({
    schema,
    doc: translator.nodeFromString(value),
    plugins: [
      inputRules(schema),
      keymap(schema, true),
      history(),
      // links(schema),
      dropCursor({ width: 2, color: 'rgb(33, 224, 158)' }),
      gapCursor(),
      menu(translator, false),
      ...plugins,
    ],
  })
}
