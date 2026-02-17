// import { insertEmptyCodeBlock } from '../../../transforms/insert-empty-block';
import { preFormat } from './autoformat-utils';
import { BaseBlockquotePlugin } from '@platejs/basic-nodes';

// Define heading keys locally
const HEADING_KEYS = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6' };
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseHorizontalRulePlugin } from '@platejs/basic-nodes';
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
    type: BaseBlockquotePlugin.key,
    match: '> ',
    preFormat,
  },
  {
    mode: 'block',
    type: BaseCodeBlockPlugin.key,
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
    type: BaseHorizontalRulePlugin.key,
    match: ['---', '—-', '___ '],
    format: (editor) => {
      editor.tf.setNodes({ type: BaseHorizontalRulePlugin.key });
      editor.tf.insertNodes({
        type: ParagraphPlugin.key,
        children: [{ text: '' }],
      });
    },
  },
];
