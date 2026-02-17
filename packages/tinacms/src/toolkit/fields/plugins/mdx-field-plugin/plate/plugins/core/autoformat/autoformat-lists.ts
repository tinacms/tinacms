import { formatList, preFormat } from './autoformat-utils';
import { AutoformatRule } from '@platejs/autoformat';
import {
  BaseBulletedListPlugin,
  BaseListItemPlugin,
  BaseNumberedListPlugin,
  BaseTodoListPlugin,
} from '@platejs/list-classic';

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: BaseListItemPlugin.key,
    match: ['* ', '- '],
    preFormat,
    format: (editor) => formatList(editor, BaseBulletedListPlugin.key),
  },
  {
    mode: 'block',
    type: BaseListItemPlugin.key,
    match: ['1. ', '1) '],
    preFormat,
    format: (editor) => formatList(editor, BaseNumberedListPlugin.key),
  },
  {
    mode: 'block',
    type: BaseTodoListPlugin.key,
    match: '[] ',
  },
  {
    mode: 'block',
    type: BaseTodoListPlugin.key,
    match: '[x] ',
    format: (editor) =>
      editor.tf.setNodes(
        { type: BaseTodoListPlugin.key, checked: true },
        {
          match: (n) => editor.api.isBlock(n),
        }
      ),
  },
];
