import { AutoformatRule, ELEMENT_HR } from '@udecode/plate';
import { insertEmptyCodeBlock } from '../../../transforms/insert-empty-block';
import { preFormat } from './autoformat-utils';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';

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
    triggerAtBlockStart: false,
    preFormat,
    format: (editor) => {
      insertEmptyCodeBlock(editor);
    },
  },
  {
    mode: 'block',
    type: ELEMENT_HR,
    match: ['---', '—-', '___ '],
    format: (editor) => {
      setNodes(editor, { type: ELEMENT_HR });
      insertNodes(editor, {
        type: ELEMENT_DEFAULT,
        children: [{ text: '' }],
      });
    },
  },
];
