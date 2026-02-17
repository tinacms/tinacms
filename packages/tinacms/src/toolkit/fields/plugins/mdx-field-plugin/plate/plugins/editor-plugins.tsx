'use client';

import { ParagraphPlugin } from 'platejs/react';
import { createSlatePlugin, ExitBreakPlugin, SoftBreakPlugin } from 'platejs';
import { AutoformatPlugin } from '@platejs/autoformat';
import {
  BoldPlugin,
  ItalicPlugin,
  CodePlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  BlockquotePlugin,
  HeadingPlugin,
  HEADING_KEYS,
  HEADING_LEVELS,
  HorizontalRulePlugin,
} from '@platejs/basic-nodes';
import { CodeBlockPlugin } from '@platejs/code-block';
import { ListPlugin as IndentListPlugin, ListStyleType } from '@platejs/list';
import { LinkPlugin } from '@platejs/link';
import {
  BulletedListPlugin,
  ListPlugin,
  NumberedListPlugin,
} from '@platejs/list-classic';
import { SlashPlugin } from '@platejs/slash-command';
import { TablePlugin } from '@platejs/table';
import React from 'react';
import { LinkFloatingToolbar } from '../components/plate-ui/link-floating-toolbar';
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
import { unwrapList } from '@platejs/list-classic';
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

// Common rule for resetting block types
const resetBlockTypesCommonRule = {
  defaultType: ParagraphPlugin.key,
  types: [...HEADING_LEVELS, BlockquotePlugin.key],
};

const resetBlockTypesCodeBlockRule = {
  types: [CodeBlockPlugin.key],
  defaultType: ParagraphPlugin.key,
  onReset: unwrapCodeBlock,
};

// View Plugins: Basic nodes and marks
export const viewPlugins = [
  BoldPlugin,
  ItalicPlugin,
  CodePlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  HeadingPlugin.configure({ options: { levels: 6 } }),
  ParagraphPlugin,
  CodeBlockPlugin.configure({
    options: { lowlight: createLowlight(all) },
  }),
  BlockquotePlugin,
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
  LinkPlugin.configure({
    options: {
      // Custom validation function to allow relative links, e.g., /about
      isUrl: (url) => isUrl(url),
    },
    render: { afterEditable: () => <LinkFloatingToolbar /> },
  }),

  ...viewPlugins,
  ListPlugin,
  IndentListPlugin,
  HorizontalRulePlugin,
  // NodeIdPlugin is now built-in to platejs core
  TablePlugin,
  SlashPlugin,
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
              match: { type: editor.getType(CodeBlockPlugin.key) },
            }),
        })
      ),
    },
  }),

  // ExitBreakPlugin lets users "break out" of a block (like a heading)
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
  // NOTE: ResetNodePlugin was removed in platejs v49+. Reset behavior is now configured via plugin rules.
  // TODO: Add reset rules to individual plugins if needed (HeadingPlugin, BlockquotePlugin, etc.)
  SoftBreakPlugin.configure({
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
] as const;
