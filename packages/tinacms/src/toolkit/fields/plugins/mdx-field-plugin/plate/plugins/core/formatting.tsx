import { createSoftBreakPlugin } from '../soft-break';
import { autoformatRules } from './autoformat/autoformat-rules';
import { withCorrectVoidBehavior } from './with-correct-void-behavior';
import {
  createPluginFactory,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  ParagraphPlugin,
} from '@udecode/plate/react';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { ExitBreakPlugin } from '@udecode/plate-break/react';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { HEADING_KEYS } from '@udecode/plate-heading';

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
    ELEMENT_BLOCKQUOTE,
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

const createCorrectNodeBehaviorPlugin = createPluginFactory({
  key: 'WITH_CORRECT_NODE_BEHAVIOR',
  withOverrides: withCorrectVoidBehavior,
});
export const plugins = [
  TrailingBlockPlugin,
  createCorrectNodeBehaviorPlugin(),
  AutoformatPlugin({
    options: {
      rules: autoformatRules,
    },
  }),
  ExitBreakPlugin({
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
            allow: KEYS_HEADING,
          },
        },
      ],
    },
  }),
  ResetNodePlugin({
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
            allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE],
          },
        },
      ],
    },
  }),
];
