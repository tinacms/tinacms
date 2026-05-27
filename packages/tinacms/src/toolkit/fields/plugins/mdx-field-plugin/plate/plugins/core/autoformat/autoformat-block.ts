// import { insertEmptyCodeBlock } from '../../../transforms/insert-empty-block';
import { preFormat } from './autoformat-utils';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { AutoformatRule } from '@udecode/plate-autoformat';
import { ParagraphPlugin } from '@udecode/plate/react';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { ALL_HEADING_LEVELS, type HeadingLevel } from '@tinacms/schema-tools';

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
  ...headingLevels.map((level) => headingAutoformatByLevel[level]),
  ...nonHeadingAutoformatBlocks,
];

// Default rule set with all heading levels — consumed by the static
// `autoformatRules` aggregate. The field-aware editor opts into a
// filtered set via `getAutoformatBlocks(headingLevels)`.
export const autoformatBlocks: AutoformatRule[] = getAutoformatBlocks();
