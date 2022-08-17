/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import {
  ELEMENT_CODE_BLOCK,
  PlateEditor,
  getPluginType,
  insertNode,
  someNode,
  TElement,
  isSelectionAtBlockStart,
  setElements,
} from '@udecode/plate-headless'

export const insertEmptyCodeBlock = (editor: PlateEditor) => {
  const matchCodeElements = (node: TElement) =>
    node.type === getPluginType(editor, ELEMENT_CODE_BLOCK)

  if (
    someNode(editor, {
      match: matchCodeElements,
    })
  ) {
    return
  }

  const node = {
    type: ELEMENT_CODE_BLOCK,
    value: '',
    // TODO: this can probably be a config option
    lang: 'javascript',
    children: [{ type: 'text', text: '' }],
  }

  if (isSelectionAtBlockStart(editor)) {
    setElements(editor, node)
  } else {
    insertNode(editor, node)
  }
}
