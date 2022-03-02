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
  getLastNode,
  insertNodes,
  queryNode,
  TElement,
  WithOverride,
} from '@udecode/plate-core'
import { Path } from 'slate'
import { TrailingBlockPlugin } from './createTrailingBlockPlugin'
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'
import { ELEMENT_IMG } from '../../create-img-plugin'
import { ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE } from '../../create-mdx-plugins'

/**
 * TODO: This is nearly an exact copy from the plate one, but for some reason
 * their conditional check never passes so it wasn't working
 */
export const withTrailingBlock: WithOverride<{}, TrailingBlockPlugin> = (
  editor,
  { options: { level, ...query } }
) => {
  const { normalizeNode } = editor

  editor.normalizeNode = ([currentNode, currentPath]) => {
    const lastChild = getLastNode(editor, level!)

    const lastChildNode = lastChild?.[0]

    const voidTypes = [ELEMENT_MDX_BLOCK, ELEMENT_MDX_INLINE, ELEMENT_IMG]
    if (
      !lastChildNode ||
      (voidTypes.includes(lastChildNode.type) && queryNode(lastChild, query))
    ) {
      const at = lastChild ? Path.next(lastChild[1]) : [0]

      insertNodes<TElement>(
        editor,
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: '' }],
        },
        { at }
      )
      return
    }

    return normalizeNode([currentNode, currentPath])
  }

  return editor
}
