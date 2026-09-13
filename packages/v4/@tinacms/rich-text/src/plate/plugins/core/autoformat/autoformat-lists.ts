import { type SlateEditor, isType } from '@udecode/plate';
import { AutoformatRule } from '@udecode/plate-autoformat';
import {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { formatList, preFormat } from './autoformat-utils';

/**
 * A task list is a bulleted list whose items carry `checked`. The codec reads
 * and writes that shape, so a task item must stay an `li` inside a `ul`.
 */
const formatTask = (editor: SlateEditor, checked: boolean) => {
  formatList(editor, BulletedListPlugin.key);
  editor.tf.setNodes(
    { checked },
    { match: (node) => isType(editor, node, ListItemPlugin.key) }
  );
};

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
    type: ListItemPlugin.key,
    match: '[] ',
    preFormat,
    format: (editor) => formatTask(editor, false),
  },
  {
    mode: 'block',
    type: ListItemPlugin.key,
    match: '[x] ',
    preFormat,
    format: (editor) => formatTask(editor, true),
  },
];
