import { AutoformatPlugin } from '@platejs/autoformat';
import { BaseBlockquotePlugin, HeadingLevel } from '@platejs/basic-nodes';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { ExitBreakPlugin } from 'platejs';
import { ParagraphPlugin } from 'platejs/react';
import { autoformatRules } from './autoformat/autoformat-rules';

// Define heading keys for compatibility
const HEADING_KEYS = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

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
  // NOTE: SoftBreakPlugin was removed in platejs v49+. Shift+Enter is now built-in.
  // NOTE: ResetNodePlugin was removed in platejs v49+. Reset behavior is now configured via plugin rules.
];
