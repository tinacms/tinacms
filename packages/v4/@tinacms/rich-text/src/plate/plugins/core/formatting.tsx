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

export const plugins: any[] = [
  TrailingBlockPlugin,
  AutoformatPlugin.configure({
    options: {
      rules: autoformatRules,
    },
  }),
  ExitBreakPlugin.configure({
    options: {
      rules: [
        {
          hotkey: 'mod+enter',
        },
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
  ResetNodePlugin.configure({}),
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
