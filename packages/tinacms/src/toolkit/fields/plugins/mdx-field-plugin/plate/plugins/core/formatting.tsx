import { AutoformatPlugin } from '@platejs/autoformat';
import { BlockquotePlugin, HEADING_KEYS, HEADING_LEVELS } from '@platejs/basic-nodes';
import { CodeBlockPlugin } from '@platejs/code-block';
import { ExitBreakPlugin, SoftBreakPlugin } from 'platejs';
import { ParagraphPlugin } from 'platejs/react';
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

export const plugins = [
  // TrailingBlockPlugin is now built-in to platejs core
  AutoformatPlugin.configure({
    options: {
      rules: autoformatRules,
    },
  }),
  // ExitBreakPlugin now uses shortcuts syntax in v49+
  ExitBreakPlugin.configure({
    shortcuts: {
      insert: { keys: 'mod+enter' },
      insertBefore: { keys: 'mod+shift+enter' },
    },
  }),
  // ResetNodePlugin was removed in platejs v49+. Reset behavior is now configured via plugin rules.
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
