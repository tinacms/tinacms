import { ELEMENT_TODO_LI } from '@udecode/plate-list';
import { formatList, preFormat } from './autoformat-utils';
import { setNodes } from '@udecode/plate/react';
import { AutoformatRule } from '@udecode/plate-autoformat';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ListItemPlugin.key,
    match: ['* ', '- '],
    preFormat,
    format: (editor) => formatList(editor, BulletedListPlugin.key),
  },
  {
    mode: 'block',
    type: ListItemPlugin.key,
    match: ['1. ', '1) '],
    preFormat,
    format: (editor) => formatList(editor, NumberedListPlugin.key),
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
          match: (n) => editor.api.isBlock(n),
        }
      ),
  },
];
