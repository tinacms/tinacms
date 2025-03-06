import { createSoftBreakPlugin } from '../soft-break';
import { withCorrectVoidBehavior } from './with-correct-void-behavior';
import { createPlatePlugin, ParagraphPlugin } from '@udecode/plate/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import { ExitBreakPlugin } from '@udecode/plate-break/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { autoformatRules } from './autoformat/autoformat-rules';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';

export const HANDLES_MDX = [
  HEADING_KEYS.h1,
  HEADING_KEYS.h2,
  HEADING_KEYS.h3,
  HEADING_KEYS.h4,
  HEADING_KEYS.h5,
  HEADING_KEYS.h6,
  ParagraphPlugin.key,
];

const resetBlockTypesCommonRule = {
  types: [
    BlockquotePlugin.key,
    HEADING_KEYS.h1,
    HEADING_KEYS.h2,
    HEADING_KEYS.h3,
    HEADING_KEYS.h4,
    HEADING_KEYS.h5,
    HEADING_KEYS.h6,
    // NOTE: code blocks behave strangely when used here
  ],
  defaultType: ParagraphPlugin.key,
};

const CorrectNodeBehaviorPlugin = createPlatePlugin({
  key: 'WITH_CORRECT_NODE_BEHAVIOR',
  options: {
    withOverrides: withCorrectVoidBehavior,
  },
});

export const plugins = [
  TrailingBlockPlugin,
  CorrectNodeBehaviorPlugin,
  AutoformatPlugin.configure({
    options: {
      rules: autoformatRules,
    },
  }),
  ExitBreakPlugin.configure({
    options: {
      rules: [
        // Break out of a block entirely, eg. get out of a blockquote
        // TOOD: maybe this should be shift+enter, but that's a soft break
        // for other things like list items (see below)
        {
          hotkey: 'mod+enter',
        },
        // Same as above but drops you at the top of a block
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: HEADING_LEVELS,
          },
        },
      ],
    },
  }),
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Enter',
          predicate: isBlockAboveEmpty,
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Backspace',
          predicate: isSelectionAtBlockStart,
        },
      ],
    },
  }),
  createSoftBreakPlugin({
    options: {
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [CodeBlockPlugin.key, BlockquotePlugin.key],
          },
        },
      ],
    },
  }),
];
