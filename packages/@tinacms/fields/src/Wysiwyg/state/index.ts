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

import { Plugin } from '@tinacms/core'
import { Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'

import { inputRules } from './plugins/input-rules'
import { Translator } from '../Translator'
import { menu } from './plugins/Menu'
import { buildKeymap } from './buildKeymap'
import { links } from './plugins/links'

export function createEditorState(
  schema: Schema,
  translator: Translator,
  plugins: Plugin[],
  value: string,
  frame: any,
  theme: any // TODO: update type
) {
  return EditorState.create({
    schema,
    doc: translator.nodeFromString(value),
    plugins: [
      inputRules(schema),
      keymap(buildKeymap(schema, plugins)),
      history(),
      links(schema, frame, theme),
      dropCursor({ width: 2, color: 'rgb(33, 224, 158)' }),
      gapCursor(),
      menu(translator, false, frame, theme),
    ],
  })
}
