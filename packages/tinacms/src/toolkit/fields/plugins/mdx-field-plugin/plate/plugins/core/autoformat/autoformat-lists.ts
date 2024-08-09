import {
  type AutoformatRule,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/plate'
import { formatList, preFormat } from './autoformat-utils'
import { isBlock, setNodes } from '@udecode/plate-common'

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
