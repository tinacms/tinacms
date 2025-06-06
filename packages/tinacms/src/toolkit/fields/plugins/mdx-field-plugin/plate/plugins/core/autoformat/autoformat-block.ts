// import { insertEmptyCodeBlock } from '../../../transforms/insert-empty-block';
import { preFormat } from './autoformat-utils';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { AutoformatRule } from '@udecode/plate-autoformat';
import { ParagraphPlugin } from '@udecode/plate/react';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';

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
