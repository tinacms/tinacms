import { formatList, preFormat } from './autoformat-utils';
import { AutoformatRule } from '@udecode/plate-autoformat';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
  TodoListPlugin,
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
    type: TodoListPlugin.key,
    match: '[] ',
  },
  {
    mode: 'block',
    type: TodoListPlugin.key,
    match: '[x] ',
    format: (editor) =>
      editor.tf.setNodes(
        { type: TodoListPlugin.key, checked: true },
        {
          match: (n) => editor.api.isBlock(n),
        }
      ),
  },
];
