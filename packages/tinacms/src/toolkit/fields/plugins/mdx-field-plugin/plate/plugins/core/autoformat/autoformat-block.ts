// import { insertEmptyCodeBlock } from '../../../transforms/insert-empty-block';
import { preFormat } from './autoformat-utils';
import { HEADING_KEYS } from '@platejs/basic-nodes';
import { BlockquotePlugin } from '@platejs/basic-nodes';
import { CodeBlockPlugin } from '@platejs/code-block';
import { HorizontalRulePlugin } from '@platejs/basic-nodes';
import { AutoformatRule } from '@platejs/autoformat';
import { ParagraphPlugin } from 'platejs/react';
import { insertEmptyCodeBlock } from '@platejs/code-block';

export const autoformatBlocks: AutoformatRule[] = [
  {
    mode: 'block',
    type: HEADING_KEYS.h1,
    match: '# ',
    preFormat,
  },
  {
    mode: 'block',
    type: HEADING_KEYS.h2,
    match: '## ',
    preFormat,
  },
  {
    mode: 'block',
    type: HEADING_KEYS.h3,
    match: '### ',
    preFormat,
  },
  {
    mode: 'block',
    type: HEADING_KEYS.h4,
    match: '#### ',
    preFormat,
  },
  {
    mode: 'block',
    type: HEADING_KEYS.h5,
    match: '##### ',
    preFormat,
  },
  {
    mode: 'block',
    type: HEADING_KEYS.h6,
    match: '###### ',
    preFormat,
  },
  {
    mode: 'block',
    type: BlockquotePlugin.key,
    match: '> ',
    preFormat,
  },
  {
    mode: 'block',
    type: CodeBlockPlugin.key,
    match: '```',
    preFormat,
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ParagraphPlugin.key,
        insertNodesOptions: { select: true },
      });
    },
  },
  {
    mode: 'block',
    type: HorizontalRulePlugin.key,
    match: ['---', '—-', '___ '],
    format: (editor) => {
      editor.tf.setNodes({ type: HorizontalRulePlugin.key });
      editor.tf.insertNodes({
        type: ParagraphPlugin.key,
        children: [{ text: '' }],
      });
    },
  },
];
