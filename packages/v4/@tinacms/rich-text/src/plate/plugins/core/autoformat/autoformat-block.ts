import {
  ALL_HEADING_LEVELS,
  type HeadingLevel,
  normalizeHeadingLevels,
} from '@tinacms/schema-tools';
import { AutoformatRule } from '@udecode/plate-autoformat';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { ParagraphPlugin } from '@udecode/plate/react';
import { preFormat } from './autoformat-utils';

const headingAutoformatByLevel: Record<HeadingLevel, AutoformatRule> = {
  h1: { mode: 'block', type: HEADING_KEYS.h1, match: '# ', preFormat },
  h2: { mode: 'block', type: HEADING_KEYS.h2, match: '## ', preFormat },
  h3: { mode: 'block', type: HEADING_KEYS.h3, match: '### ', preFormat },
  h4: { mode: 'block', type: HEADING_KEYS.h4, match: '#### ', preFormat },
  h5: { mode: 'block', type: HEADING_KEYS.h5, match: '##### ', preFormat },
  h6: { mode: 'block', type: HEADING_KEYS.h6, match: '###### ', preFormat },
};

const nonHeadingAutoformatBlocks: AutoformatRule[] = [
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

export const getAutoformatBlocks = (
  headingLevels: readonly HeadingLevel[] = ALL_HEADING_LEVELS
): AutoformatRule[] => [
  ...normalizeHeadingLevels(headingLevels).map(
    (level) => headingAutoformatByLevel[level]
  ),
  ...nonHeadingAutoformatBlocks,
];

export const autoformatBlocks: AutoformatRule[] = getAutoformatBlocks();
