import { Plugin } from '@tinacms/core'
import { Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
// @ts-ignore
import { dropCursor } from 'prosemirror-dropcursor'
// @ts-ignore
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'

import { inputRules } from './plugins/input-rules'
import { Translator } from '../Translator'
import { menu } from './plugins/Menu'
import { KEYMAP_PLUGINS } from '../plugins/keymap'
import { buildKeymap } from './buildKeymap'

export function createEditorState(
  schema: Schema,
  translator: Translator,
  plugins: Plugin[],
  value: string
) {
  return EditorState.create({
    schema,
    doc: translator.nodeFromString(value),
    plugins: [
      inputRules(schema),
      keymap(buildKeymap(schema, plugins)),
      history(),
      // links(schema),
      dropCursor({ width: 2, color: 'rgb(33, 224, 158)' }),
      gapCursor(),
      menu(translator, false),
    ],
  })
}
