/**



*/

import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  isBlock,
  setNodes,
} from '@udecode/plate-headless'
import type {
  TTodoListItemElement,
  TElement,
  AutoformatRule,
} from '@udecode/plate-headless'
import { Editor } from 'slate'
import { formatList, preFormat } from './autoformatUtils'

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['1. ', '1) '],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_OL),
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    match: '[] ',
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    match: '[x] ',
    format: (editor) =>
      setNodes(
        editor,
        { type: ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => isBlock(editor, n),
        }
      ),
  },
]
