import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { ParagraphPlugin } from '@udecode/plate/react';
import { autoformatRules } from './autoformat/autoformat-rules';

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

export const plugins = [
  TrailingBlockPlugin,
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
  //See the usage code example from https://platejs.org/docs/reset-node
  ResetNodePlugin.configure({
    // options: {
    //   rules: [
    //     {
    //       ...resetBlockTypesCommonRule,
    //       hotkey: 'Enter',
    //       predicate: editor.api.isEmpty(editor.selection, { block: true }),
    //     },
    //     {
    //       ...resetBlockTypesCommonRule,
    //       hotkey: 'Backspace',
    //       predicate: isSelectionAtBlockStart,
    //     },
    //   ],
    // },
  }),
  SoftBreakPlugin.configure({
    options: {
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [CodeBlockPlugin.key],
          },
        },
      ],
    },
  }),
];
