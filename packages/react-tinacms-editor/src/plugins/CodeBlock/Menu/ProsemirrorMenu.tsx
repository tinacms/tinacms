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

import { setBlockType } from 'prosemirror-commands'
import { EditorState, TextSelection } from 'prosemirror-state'

import { CodeIcon } from '@einsteinindustries/tinacms-icons'

import { commandControl } from '../../../components/MenuHelpers'
import { formatKeymap } from '../../../utils'

function makeCodeBlock(state: EditorState, dispatch: any) {
  const { code_block, paragraph } = state.schema.nodes
  const { selection, tr } = state
  const currentNode = selection.$to.node(selection.$to.depth)
  if (currentNode.type === code_block)
    return setBlockType(paragraph)(state, dispatch)
  if (!dispatch || selection.empty)
    return setBlockType(code_block)(state, dispatch)

  let content = ``
  let startPos: number | undefined = undefined
  let endPos: number | undefined = undefined
  state.doc.nodesBetween(selection.from, selection.to - 1, (node, pos) => {
    if (node.isTextblock) {
      if (startPos === undefined) startPos = pos
      if (content.length)
        content += `
`
      content += node.textContent
      endPos = pos + node.textContent.length + 1
    }
  })
  const codeBlock = code_block.createChecked()
  return dispatch(
    tr
      .replaceRangeWith(startPos!, endPos! + 1, codeBlock)
      .insertText(content, startPos! + 1)
      .setSelection(
        new TextSelection(tr.doc.resolve(startPos! + content.length + 1))
      )
  )
}

export const ProsemirrorMenu = commandControl(
  makeCodeBlock,
  CodeIcon,
  'Codeblock',
  formatKeymap('Codeblock Mod-Alt-0'),
  true
) //codeblock focusing messes with scroll
