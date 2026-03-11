'use client';

import { ParagraphPlugin } from 'platejs/react';
import { createSlatePlugin, ExitBreakPlugin } from 'platejs';
import { AutoformatPlugin } from '@platejs/autoformat';
import {
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseHighlightPlugin,
  HeadingLevel,
} from '@platejs/basic-nodes';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { BaseListPlugin as BaseIndentListPlugin } from '@platejs/list';
import { BaseLinkPlugin } from '@platejs/link';
import {
  BaseBulletedListPlugin,
  BaseListPlugin,
  BaseNumberedListPlugin,
} from '@platejs/list-classic';
import { BaseSlashPlugin } from '@platejs/slash-command';
import { BaseTablePlugin } from '@platejs/table';

// Define heading keys for compatibility
const HEADING_KEYS = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};
const HEADING_LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6];
import React from 'react';
import { isUrl } from '../transforms/is-url';
import createImgPlugin from './create-img-plugin';
import { createInvalidMarkdownPlugin } from './create-invalid-markdown-plugin';
import {
  createMdxBlockPlugin,
  createMdxInlinePlugin,
} from './create-mdx-plugins';
import { FloatingToolbarPlugin } from './ui/floating-toolbar-plugin';
import {
  autoformatArrow,
  autoformatLegal,
  autoformatMath,
  autoformatPunctuation,
  AutoformatRule,
  autoformatSmartQuotes,
} from '@platejs/autoformat';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@platejs/code-block';
// @ts-ignore
// NOTE: Linter complains about ESM import here, as per conversation with Jeff it will be fine at build time—ignore this linting error for now.
import { all, createLowlight } from 'lowlight';
import { autoformatBlocks } from './core/autoformat/autoformat-block';
import { autoformatLists } from './core/autoformat/autoformat-lists';
import { autoformatMarks } from './core/autoformat/autoformat-marks';
import {
  createBlockquoteEnterBreakPlugin,
  createBreakPlugin,
  createHTMLInlinePlugin,
} from './create-html-block';
import { createHTMLBlockPlugin } from './create-html-block';

// Define block types that support MDX embedding
export const HANDLES_MDX = [
  HEADING_KEYS.h1,
  HEADING_KEYS.h2,
  HEADING_KEYS.h3,
  HEADING_KEYS.h4,
  HEADING_KEYS.h5,
  HEADING_KEYS.h6,
  ParagraphPlugin.key,
];

// View Plugins: Basic nodes and marks
export const viewPlugins = [
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BaseHighlightPlugin, // Added for text highlighting
  BaseHeadingPlugin.configure({ options: { levels: 6 } }),
  ParagraphPlugin,
  BaseCodeBlockPlugin.configure({
    options: { lowlight: createLowlight(all) },
  }),
  BaseBlockquotePlugin,
] as const;

const CorrectNodeBehaviorPlugin = createSlatePlugin({
  key: 'WITH_CORRECT_NODE_BEHAVIOR',
});

// Editor Plugins: Functional and formatting plugins
export const editorPlugins = [
  createMdxBlockPlugin,
  createMdxInlinePlugin,
  createImgPlugin,
  createHTMLBlockPlugin,
  createHTMLInlinePlugin,
  createBlockquoteEnterBreakPlugin,
  createInvalidMarkdownPlugin,
  CorrectNodeBehaviorPlugin,
  BaseLinkPlugin.configure({
    options: {
      // Custom validation function to allow relative links, e.g., /about
      isUrl: (url) => isUrl(url),
    },
  }),

  ...viewPlugins,
  BaseListPlugin,
  BaseIndentListPlugin,
  BaseHorizontalRulePlugin,
  // NodeIdPlugin is now built-in to platejs core
  BaseTablePlugin,
  BaseSlashPlugin,
  // TrailingBlockPlugin is now built-in to platejs core
  createBreakPlugin,
  FloatingToolbarPlugin,

  AutoformatPlugin.configure({
    options: {
      enableUndoOnDelete: true,
      rules: [
        ...autoformatMarks,
        ...autoformatBlocks,
        ...autoformatLists,
        ...autoformatSmartQuotes,
        ...autoformatPunctuation,
        ...autoformatLegal,
        ...autoformatArrow,
        ...autoformatMath,
      ].map(
        (rule): AutoformatRule => ({
          ...rule,
          query: (editor) =>
            !editor.api.some({
              match: { type: editor.getType(BaseCodeBlockPlugin.key) },
            }),
        })
      ),
    },
  }),

  // ExitBreakPlugin lets users "break out" of a block (like a heading)
  ExitBreakPlugin.configure({
    shortcuts: {
      insert: { keys: 'mod+enter' },
      insertBefore: { keys: 'mod+shift+enter' },
    },
  }),
  // NOTE: SoftBreakPlugin was removed in platejs v49+. Shift+Enter is now built-in.
  // NOTE: ResetNodePlugin was removed in platejs v49+. Reset behavior is now configured via plugin rules.
] as const;
